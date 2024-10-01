import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAllContractsDetails } from "@/contracts/cairo/interfaces";
import { withApiToken } from "@/app/middleware/withApiToken";

export const dynamic = "force-dynamic";

async function getHandler() {
  return NextResponse.json(
    { availableContracts: getAllContractsDetails() },
    { status: StatusCodes.OK }
  );
}

export const GET = withApiToken(getHandler);
