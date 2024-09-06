import { NextResponse } from "next/server";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { developerAccountModel, developersUserAccountModel, smartContractModel, smartContractInteractionModel } from "@/prisma/models";
import {contractsInterfaces, getContractOutput, getContractsFunctions} from "@/contracts/interfaces";
import { getVaultItem } from "@/server/api/vault/vaultApi";
import { Account, Contract } from "starknet";
import provider from "@/contracts/provider";
import { gaslessTransaction, getGaslessTransactionCallData } from "@/services/gaslessTransaction";
import { generateSchemaForContractBody } from "@/utils/generateSchemaForContractBody";
import { retrieveWalletCredentials } from "@/utils/retrieveWalletCredentials";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";
import { withDeveloperUserAccessToken } from "@/app/middleware/withDeveloperUserAccessToken";
import { difference, keys, map, size } from "lodash-es";

interface EventConfig {
  eventName: string;
  value: string;
  saveValue?: string;
}
export interface EventsPerFunctionName {
  [key: string]: EventConfig[];
}
const eventsPerFunctionName: EventsPerFunctionName = {
  get_ticket: [
    { eventName: "TransferSingle", value: "id", saveValue: "token_id" },
  ],
};

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
      const contract =  new Contract(contractsInterfaces[contractName].abi, smartContract?.address)
      let result = await contract[functionName](...Object.values(validBody));

      if (typeof result === "bigint") {
        result = `0x${result.toString(16)}`;
      }
      return NextResponse.json(
          { result, type: typeof result },
          { status: StatusCodes.OK }
      );
    } else {
      const keys = await getVaultItem(accountData.vaultKey, "privateKey");
      const { walletAddress, privateKey } = retrieveWalletCredentials(keys);
      const account = new Account(provider, walletAddress, privateKey);
      const calldata = getGaslessTransactionCallData({
        method: functionName,
        contractAddress: contract.address,
        body,
        abiFunctions: functions,
      });

      const gaslessTransactionResult = await gaslessTransaction(account, calldata);
      const txReceiptGasless = !!gaslessTransactionResult?.transactionHash
        ? ((await provider.waitForTransaction(
          gaslessTransactionResult.transactionHash,
          )) as any)
        : null;

      const fee = parseInt((txReceiptGasless as any)?.actual_fee?.amount, 16);

      if (!!userId && !!txReceiptGasless) {
        const output = getContractOutput({
          functionName,
          contract,
          txReceipt: txReceiptGasless,
          eventsPerFunctionName,
        });

        await smartContractInteractionModel.create({
          data: {
            developerUserId: userId,
            smartContractId: smartContract.id,
            method: functionName,
            fees: `${fee}`,
            type: "gasless",
            // @ts-ignore
            output,
            input: body,
            txHash: gaslessTransactionResult.transactionHash,
          },
        });
      }

      if (!!gaslessTransactionResult.error) {
        contract.connect(account);
        let userTransactionResult = await contract[functionName](
          ...Object.values(validBody),
        );
        if (typeof userTransactionResult === "bigint") {
          userTransactionResult = `0x${userTransactionResult.toString(16)}`;
        }
        const userTxReceipt = !!userTransactionResult
          ? ((await provider.waitForTransaction(
            userTransactionResult,
            )) as any)
          : null;
        if (!!userId && !!userTxReceipt) {
          const output = getContractOutput({
            functionName,
            contract,
            txReceipt: userTxReceipt,
            eventsPerFunctionName,
          });

          await smartContractInteractionModel.create({
            data: {
              developerUserId: userId,
              smartContractId: smartContract.id,
              method: functionName,
              fees: `${fee}`,
              type: "wallet",
              // @ts-ignore
              output,
              input: body,
              txHash: userTransactionResult,
            },
          });
        }
        const gaslessError = gaslessTransactionResult.error;

        return NextResponse.json(
          {
            gaslessError,
            result: userTransactionResult,
            transactionType: "credentials",
          },
          { status: StatusCodes.OK },
        );
      }

      return NextResponse.json(
        { result: gaslessTransactionResult, transactionType: "gasless" },
        { status: StatusCodes.OK },
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

export const POST = withDeveloperApiToken(withDeveloperUserAccessToken(postHandler));
