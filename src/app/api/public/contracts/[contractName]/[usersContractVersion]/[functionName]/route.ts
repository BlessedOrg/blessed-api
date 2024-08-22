import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import {getContractsFunctions, getGaslessTransactionCallData} from "@/contracts/interfaces";
import interactWithContract from "@/services/interactWithContract";
import {developerAccountModel, developersUserAccountModel, smartContractModel} from "@/prisma/models";
import {getVaultItem} from "@/server/vaultApi";
import {Account} from "starknet";
import provider from "@/contracts/provider";
import {gaslessTransaction} from "@/services/gaslessTransaction";
import {generateSchemaForContractBody} from "@/utils/generateSchemaForContractBody";
import {retrieveWalletCredentials} from "@/utils/retrieveWalletCredentials";
import {cairoInputsFormat} from "@/utils/cairoInputsFormat";

async function postHandler(req: NextRequestWithAuth, { params : { contractName, usersContractVersion, functionName }}) {
  try {
    const body = await req.json();

    const functions = getContractsFunctions(contractName);
    const targetFunction = functions.find((f: any) => f.name === functionName);

    if (!targetFunction) {
      return NextResponse.json(
          { error: `Function ${functionName} for contract ${contractName} not found. Supported contracts and corresponding functions can be checked by calling endpoint /api/public/contracts` },
          { status: StatusCodes.BAD_REQUEST },
      );
    }

    const inputsExists = targetFunction.inputs.every(
        (input) => body[input.name] !== undefined,
    );

    if (!inputsExists) {
      return NextResponse.json(
          {
            error: "Missing parameters",
            requiredParameters: cairoInputsFormat(targetFunction.inputs),
          },
          { status: StatusCodes.BAD_REQUEST },
      );
    }

    const smartContract = await smartContractModel.findFirst({
      where: {
        developerUserId: req.userId,
        userVersion: Number(usersContractVersion),
        name: contractName
      }
    });

    if (!smartContract) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract ${contractName} v${usersContractVersion} from User ${req.userId} not found.` },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const schema = generateSchemaForContractBody(targetFunction);
    const bodyValidation = schema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
          { error: bodyValidation.error },
          { status: StatusCodes.BAD_REQUEST },
      );
    }
    const validBody: any = bodyValidation.data

    const contract = connectToContract({
      address: smartContract?.address,
      name: contractName
    });

    const userId = req.userId;
    const developerId = req.developerId;
    const accountData = !!userId ? await developersUserAccountModel.findUnique({ where: { id: userId }}) : await developerAccountModel.findUnique({where: {id: developerId}})

    if(targetFunction.type === "read"){
      const result = await interactWithContract(functionName, validBody.inputs, contract)

      return NextResponse.json(
          { result: result, type: typeof result},
          { status: StatusCodes.OK },
      );
    } else {
      const keys = await getVaultItem(accountData.vaultKey, 'privateKey');
      const {walletAddress, privateKey} = retrieveWalletCredentials(keys)

      const account = new Account(provider, walletAddress, privateKey);
      const calldata = getGaslessTransactionCallData(
          functionName,
          contract.address,
          body,
          functions,
      );
      const transactionResult = await gaslessTransaction(account, calldata);

      if(!!transactionResult.error){
        contract.connect(account);
        const inputs = Object.values(body)
        const userTransactionResult = await interactWithContract(functionName, inputs, contract)
        const gaslessError= transactionResult.error

        return NextResponse.json({ gaslessError, result: userTransactionResult, transactionType: "credentials" }, { status: StatusCodes.OK });
      }

      return NextResponse.json(
          { result: transactionResult, transactionType: "gasless"},
          { status: StatusCodes.OK },
      );

    }
  } catch (error) {
    console.log("🚨 Error while interacting with Smart Contract:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST },
    );
  }
}

export const POST = withApiToken(postHandler);
