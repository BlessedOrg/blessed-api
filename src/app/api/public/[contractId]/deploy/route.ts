import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/services/deployContract";

// 🚨Below is the example of constructor args for this Sample contract - pass it in the req body
// const constructorArgs = {
//   owner: '0x0384753535a8f4febe864e07d6c2bf0ea7be049cfaa1c5ebe9106b467b406a8e',
//   tax_recipient: '0x0384753535a8f4febe864e07d6c2bf0ea7be049cfaa1c5ebe9106b467b406a8e',
// }

async function postHandler(req: NextRequest) {
  const contractId = req.nextUrl.pathname.split("/api/public/")[1].split("/deploy")[0];

  // TODO: query the contract details based on the contractId from the URL
  const classHash = `0x019994ff99f2a22bda55218dc609fe644d977a0581694d1d6a2bd05977376b52`;
  const constructorArgs = ["tax_recipient", "owner"];

  const body = await req.json();

  if (!isEqual(sortBy(constructorArgs), Object.keys(body))) {
    return NextResponse.json(
      { error: `Invalid constructor arguments for contract ${contractId}` },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const deployResponse = await deployContract({
    contractId,
    constructorArgs: body,
    classHash
  });

  return NextResponse.json(
    { contractAddress: deployResponse.contract_address },
    { status: StatusCodes.OK },
  );
}

export const POST = withAuth(postHandler);
