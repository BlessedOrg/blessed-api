import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
// import { getAllContractsDetails } from "@/contracts/cairo/interfaces";

export const dynamic = "force-dynamic";

async function getHandler() {
  return NextResponse.json(
    // { availableContracts: getAllContractsDetails() },
    { status: StatusCodes.OK }
  );
}

export const GET = withDeveloperAccessToken(getHandler);
