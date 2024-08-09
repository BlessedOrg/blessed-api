import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { getContractsFunctions } from "@/contracts/interfaces";
import z from "zod";
import parseContractResponse from "@/services/parseContractResponse";
import validateRequestsBody from "@/services/validateRequestsBody";

async function postHandler(req: NextRequest, { params : { contractName }}) {
  const functions = getContractsFunctions(contractName);

  const body = await req.json();

  const func = functions.find((f: any) => f.name === body.functionName);
  if (!func) {
    return NextResponse.json(
      { error: `Function ${body.functionName} for contract ${contractName} not found. Supported contracts and corresponding functions can be checked by calling endpoint /api/public/contracts` },
      { status: StatusCodes.BAD_REQUEST } as any,
    );
  }

  const schema = z.object({
    contractAddress: z.string(),
    functionName: z.enum(functions.map((f: any) => f.name)),
    inputs: z.array(
      z.object({
        name: z.enum(func.inputs.map((i: any) => i.name)),
        value: z.union([z.string(), z.number()])
      })
    )
  });

  const validBody = validateRequestsBody(schema, body);

  const contract = connectToContract({ 
    address: (validBody as any)?.data?.contractAddress,
    name: contractName
  });

  const result = await parseContractResponse(validBody, contract)
  
  return NextResponse.json(
    { result: result, type: typeof result },
    { status: StatusCodes.OK } as any,
  );
}

export const POST = withAuth(postHandler);
