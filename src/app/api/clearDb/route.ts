import { apiTokenModel, developerAccountModel, developersUserAccountModel, sessionModel, smartContractModel } from "@/prisma/models";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

async function getHandler(req: NextRequestWithAuth) {
  await smartContractModel.deleteMany();
  await developersUserAccountModel.deleteMany();
  await sessionModel.deleteMany();
  await apiTokenModel.deleteMany();
  await developerAccountModel.deleteMany();

  return NextResponse.json(
    { result: "deleted" },
    { status: StatusCodes.OK }
  );
}

export const GET = getHandler;
