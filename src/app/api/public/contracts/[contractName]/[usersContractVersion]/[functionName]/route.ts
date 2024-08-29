import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { getContractsFunctions, getGaslessTransactionCallData } from "@/contracts/interfaces";
import { developerAccountModel, developersUserAccountModel, smartContractModel } from "@/prisma/models";
import { getVaultItem } from "@/server/vaultApi";
import { Account } from "starknet";
import provider from "@/contracts/provider";
import { gaslessTransaction } from "@/services/gaslessTransaction";
import { generateSchemaForContractBody } from "@/utils/generateSchemaForContractBody";
import { retrieveWalletCredentials } from "@/utils/retrieveWalletCredentials";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";
import { map, difference, keys, size } from "lodash-es";

async function postHandler(req: NextRequestWithAuth, { params: { contractName, usersContractVersion, functionName } }) {
  try {
    const body = await req.json();
    const functions = getContractsFunctions(contractName);
    const targetFunction = functions.find((f: any) => f.name === functionName);

    if (!targetFunction) {
      return NextResponse.json(
        { error: `Function ${functionName} for contract ${contractName} not found. Supported contracts and corresponding functions can be checked by calling endpoint /api/public/contracts` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const inputsExists = targetFunction.inputs.every(input => body[input.name] !== undefined);

    if (!inputsExists) {

      const requiredInputNames = map(cairoInputsFormat(targetFunction.inputs), 'name');
      const missingParameter = difference(requiredInputNames, keys(body));

      return NextResponse.json(
        {
          error: size(missingParameter) > 1 ? "Missing parameters" : "Missing parameter",
          missingParameter,
          requiredParameters: cairoInputsFormat(targetFunction.inputs),
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const smartContract = await smartContractModel.findFirst({
      where: {
        developerId: req.developerId,
        version: Number(usersContractVersion),
        name: contractName
      }
    });

    if (!smartContract) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract ${contractName} v${usersContractVersion} from User ${req.userId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const schema = generateSchemaForContractBody(targetFunction);
    const bodyValidation = schema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        { error: bodyValidation.error },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const validBody: any = bodyValidation.data;

    const contract = connectToContract({
      address: smartContract?.address,
      name: contractName
    });

    const userId = req.userId;
    const developerId = req.developerId;
    const accountData = !!userId
      ? await developersUserAccountModel.findUnique({ where: { id: userId } })
      : await developerAccountModel.findUnique({ where: { id: developerId } });

    if (targetFunction.type === "read") {

      let result = await contract[functionName](...Object.values(validBody));
      if (typeof result === "bigint") {
        result = `0x${result.toString(16)}`;
      }

      return NextResponse.json(
        { result: result, type: typeof result },
        { status: StatusCodes.OK }
      );
    } else {
      const keys = await getVaultItem(accountData.vaultKey, "privateKey");
      const { walletAddress, privateKey } = retrieveWalletCredentials(keys);

      const account = new Account(provider, walletAddress, privateKey);
      const calldata = getGaslessTransactionCallData({
        method: functionName,
        contractAddress: contract.address,
        body: body,
        abiFunctions: functions,
      })

      const transactionResult = await gaslessTransaction(account, calldata);

      if (!!transactionResult.error) {
        contract.connect(account);
        let userTransactionResult = await contract[functionName](...Object.values(validBody));
        if (typeof userTransactionResult === "bigint") {
          userTransactionResult = `0x${userTransactionResult.toString(16)}`;
        }
        const gaslessError = transactionResult.error;

        return NextResponse.json({
          gaslessError,
          result: userTransactionResult,
          transactionType: "credentials"
        }, { status: StatusCodes.OK });
      }

      return NextResponse.json(
        { result: transactionResult, transactionType: "gasless" },
        { status: StatusCodes.OK }
      );

    }
  } catch (error) {
    console.log("🚨 Error while interacting with Smart Contract:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}

export const POST = withApiToken(postHandler);
