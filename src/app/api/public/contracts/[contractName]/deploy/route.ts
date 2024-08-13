import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
 import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/services/deployContract";
import { getContractsConstructor } from "@/contracts/interfaces";

async function postHandler(req: NextRequest, { params: { contractName } }): Promise<NextResponse>  {
  const constructorArgs = getContractsConstructor(contractName);

  // TODO: query the contract class hash based on the contractName from the URL
  const classHash = `0x019994ff99f2a22bda55218dc609fe644d977a0581694d1d6a2bd05977376b52`;

  const body = await req.json();
  if (!isEqual(sortBy(constructorArgs), Object.keys(body)) && !isEmpty(body)) {
    return NextResponse.json(
      { error: `Invalid constructor arguments for contract ${contractName}. The proper arguments are: ${constructorArgs}` },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const deployResponse = await deployContract({
    contractName,
    constructorArgs: body,
    classHash
  });
  
  return NextResponse.json(
    { ...deployResponse },
    { status: StatusCodes.OK } ,
  );
}

export const POST = withAuth(postHandler);
