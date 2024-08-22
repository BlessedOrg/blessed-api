import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { getContractsFunctions } from "@/contracts/interfaces";
import z from "zod";
import interactWithContract from "@/services/interactWithContract";
import validateRequestsBody from "@/services/validateRequestsBody";
import { smartContractModel } from "@/prisma/models";

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

    const schema = z.object({
      inputs: z.array(
        z.object({
          name: z.enum(targetFunction.inputs.map((i: any) => i.name)),
          value: z.union([z.string(), z.number()])
        })
      )
    });

    const validBody: any = validateRequestsBody(schema, body);

    const contract = connectToContract({
      address: smartContract?.address,
      name: contractName
    });

    const result = await interactWithContract(functionName, validBody.inputs, contract)

    return NextResponse.json(
      { result: result, type: typeof result },
      { status: StatusCodes.OK },
    );
  } catch (error) {
    console.log("🚨 Error while interacting with Smart Contract:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST },
    );
  }
}

export const POST = withApiToken(postHandler);
