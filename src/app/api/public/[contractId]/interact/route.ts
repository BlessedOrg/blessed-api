import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { StatusCodes } from "http-status-codes";
import connectToContract from "@/services/connectToContract";
import { getContractsFunctions } from "@/contracts/interfaces";
import z from "zod";
import parseContractResponse from "@/services/parseContractResponse";
import parseRequestBody from "@/services/parseRequestBody";

async function postHandler(req: NextRequest) {
  const contractId = req.nextUrl.pathname.split("/api/public/")[1].split("/interact")[0];
  const functions = getContractsFunctions(contractId);

  const body = await req.json();

  const func = functions.find((f: any) => f.name === body.functionName);
  if (!func) {
    return NextResponse.json(
      { error: `Function ${body.functionName} for contract ${contractId} not found. Supported contracts and corresponding functions can be checked by calling endpoint /api/public/contracts` },
      { status: StatusCodes.BAD_REQUEST },
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

  const parsedBody = parseRequestBody(schema, body);

  const contract = connectToContract({ 
    address: (parsedBody as any)?.data?.contractAddress,
    id: contractId
  });

  const result = await parseContractResponse(parsedBody, contract)
  
  return NextResponse.json(
    { result: result, type: typeof result },
    { status: StatusCodes.OK },
  );
}

export const POST = withAuth(postHandler);
