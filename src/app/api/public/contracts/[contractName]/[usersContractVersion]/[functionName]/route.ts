import { NextResponse } from "next/server";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { developerAccountModel, developersUserAccountModel, smartContractInteractionModel, smartContractModel } from "@/prisma/models";
import { contractsInterfaces, getContractOutput, getContractsFunctions } from "@/contracts/interfaces";
import { Contract } from "starknet";
import provider from "@/contracts/provider";
import { generateSchemaForContractBody } from "@/utils/generateSchemaForContractBody";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";
import { withDeveloperUserAccessToken } from "@/app/middleware/withDeveloperUserAccessToken";
import { difference, keys, map, size } from "lodash-es";
import { gaslessTransactionWithFallback } from "@/server/gaslessTransactionWithFallback";
import { getAccountInstance } from "@/server/api/accounts/getAccountInstance";
import formatCairoFunctionResult from "@/utils/formatCairoFunctionResult";

export const maxDuration = 300;

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
    { eventName: "TransferSingle", value: "id", saveValue: "token_id" }
  ]
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
      const requiredInputNames = map(cairoInputsFormat(targetFunction.inputs), "name");
      const missingParameter = difference(requiredInputNames, keys(body));

      return NextResponse.json(
        {
          error: size(missingParameter) > 1 ? "Missing parameters" : "Missing parameter",
          missingParameter,
          requiredParameters: cairoInputsFormat(targetFunction.inputs)
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
    const targetAccount = !!userId
      ? await developersUserAccountModel.findUnique({ where: { id: userId }, select: { id: true } })
      : await developerAccountModel.findUnique({ where: { id: developerId }, select: { id: true } });
    const { account } = await getAccountInstance(!!userId ? { userId: targetAccount.id } : { developerId: targetAccount.id });
    if (targetFunction.type === "read") {
      const contract = new Contract(contractsInterfaces[contractName].abi, smartContract?.address);
      contract.connect(account);
      let result = await contract[functionName](...Object.values(validBody));
      const initialType = typeof result;
      return NextResponse.json(
        {
          result: formatCairoFunctionResult(result, targetFunction),
          type: initialType
        },
        { status: StatusCodes.OK }
      );
    } else {
      const transactionResult = await gaslessTransactionWithFallback(account, functionName, contract, body, functions);
      const txReceipt = !!transactionResult?.txHash
        ? ((await provider.waitForTransaction(
          transactionResult?.txHash
        )) as any)
        : null;

      if (!!transactionResult.error) {
        return NextResponse.json(
          { result: transactionResult },
          { status: StatusCodes.BAD_REQUEST }
        );
      }

      const fee = parseInt((txReceipt as any)?.actual_fee?.amount, 16);

      if (!!userId && !!txReceipt) {
        const output = getContractOutput({
          functionName,
          contract,
          txReceipt: txReceipt,
          eventsPerFunctionName
        });

        await smartContractInteractionModel.create({
          data: {
            developerUserId: userId,
            smartContractId: smartContract.id,
            method: functionName,
            fees: `${fee}`,
            type: transactionResult.type as "wallet" | "gasless",
            output,
            input: body,
            txHash: transactionResult.txHash
          }
        });
      }

      return NextResponse.json(
        { result: transactionResult },
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

export const POST = withDeveloperApiToken(withDeveloperUserAccessToken(postHandler));
