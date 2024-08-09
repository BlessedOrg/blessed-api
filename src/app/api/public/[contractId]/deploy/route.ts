import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
 import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/services/deployContract";
import { getContractsConstructor } from "@/contracts/interfaces";

async function postHandler(req: NextRequest): Promise<NextResponse>  {
  const contractId = req.nextUrl.pathname.split("/api/public/")[1].split("/deploy")[0];
  const constructorArgs = getContractsConstructor(contractId);

  // TODO: query the contract class hash based on the contractId from the URL
  const classHash = `0x019994ff99f2a22bda55218dc609fe644d977a0581694d1d6a2bd05977376b52`;

  const body = await req.json();
  if (!isEqual(sortBy(constructorArgs), Object.keys(body)) && !isEmpty(body)) {
    return NextResponse.json(
      { error: `Invalid constructor arguments for contract ${contractId}. The proper arguments are: ${constructorArgs}` },
      { status: StatusCodes.BAD_REQUEST } as any,
    );
  }

  const deployResponse = await deployContract({
    contractId,
    constructorArgs: body,
    classHash
  });
  
  return NextResponse.json(
    { ...deployResponse },
    { status: StatusCodes.OK }  as any,
  );
}

export const POST = withAuth(postHandler);
