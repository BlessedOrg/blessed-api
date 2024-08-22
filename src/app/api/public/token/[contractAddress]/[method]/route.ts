import { withAuth } from "@/app/middleware/withAuth";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {developerAccountModel, developersUserAccountModel, erc20TokenModel} from "@/prisma/models";
import { getVaultItem } from "@/server/vaultApi";
import provider from "@/contracts/provider";
import {Account } from "starknet";
import { gaslessTransaction } from "@/services/gaslessTransaction";

import {
  contractsInterfaces,
  getGaslessTransactionCallData,
} from "@/contracts/interfaces";
import interactWithContract from "@/services/interactWithContract";
import connectToContract from "@/services/connectToContract";
import {cairoInputsFormat} from "@/utils/cairoInputsFormat";
import {generateSchemaForContractBody} from "@/utils/generateSchemaForContractBody";
import {retrieveWalletCredentials} from "@/utils/retrieveWalletCredentials";

const erc20Abi = contractsInterfaces["CustomToken"]?.abi || [];
const erc20AllowedFunctions = erc20Abi.filter(i => i.type === "interface").flatMap(i => i.items)

async function handler(
  req: NextRequestWithAuth,
  { params: { contractAddress, method } },
) {
  const body = await req.json();
  const { userId, developerId } = req;

  const functionObject = erc20AllowedFunctions.find((m) => m.name === method);
  const inputsExists = functionObject.inputs.every(
    (input) => body[input.name] !== undefined,
  );

  if (!inputsExists) {
    return NextResponse.json(
      {
        error: "Missing parameters",
        requiredParameters: cairoInputsFormat(erc20AllowedFunctions.find((m) => m.name === method)
            .inputs),
      },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const schema = generateSchemaForContractBody(functionObject);
  const bodyValidation = schema.safeParse(body);

  if (!bodyValidation.success) {
    return NextResponse.json(
        { error: bodyValidation.error },
        { status: StatusCodes.BAD_REQUEST },
    );
  }
  if (!erc20AllowedFunctions.some((m) => m.name === method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const contractData = await erc20TokenModel.findFirst({
    where: { contractAddress },
  });

  if (!contractData) {
    return NextResponse.json(
      { error: "Contract not found" },
      { status: StatusCodes.NOT_FOUND },
    );
  }

    const accountData = !!userId ? await developersUserAccountModel.findUnique({ where: { id: userId }}) : await developerAccountModel.findUnique({where: {id: developerId}})

    const contract = connectToContract({address: contractAddress, name: "CustomToken"})

    if(functionObject.state_mutability === "view") {
      const inputs = functionObject.inputs.map((input) => body[input.name])
      const result = await interactWithContract(method, inputs, contract)

      return NextResponse.json({ result }, { status: StatusCodes.OK });
    } else {
      const keys = await getVaultItem(accountData.vaultKey, 'privateKey');
      const {walletAddress, privateKey} = retrieveWalletCredentials(keys)

      const account = new Account(provider, walletAddress, privateKey);

      const calldata = getGaslessTransactionCallData(
          method,
          contractAddress,
          body,
          erc20AllowedFunctions,
      );
      const transactionResult = await gaslessTransaction(account, calldata);
      if(!!transactionResult.error){
        contract.connect(account);
        const inputs = Object.values(body)
        const userTransactionResult = await interactWithContract(method, inputs, contract)
        const gaslessError= transactionResult.error


        return NextResponse.json({ gaslessError, result: userTransactionResult, transactionType: "credentials" }, { status: StatusCodes.OK });
      }

      return NextResponse.json({ result: transactionResult, transactionType: "gasless" }, { status: StatusCodes.OK });
    }

}

export const POST = withAuth(handler);
