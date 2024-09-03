import { smartContractModel } from "@/prisma/models";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

async function getHandler(req: NextRequestWithAuth) {
  const smartContracts = await smartContractModel.deleteMany();

  return NextResponse.json(
    { result: "deleted" },
    { status: StatusCodes.OK }
  );
}

export const GET = getHandler;
