import { NextResponse } from "next/server";
import { withDevUserApiToken } from "@/app/middleware/withDevUserApiToken";
import { StatusCodes } from "http-status-codes";
import { getAllContractsDetails } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";

async function getHandler(req: NextRequestWithAuth) {
  const myContracts = await smartContractModel.findMany({
    where: {
      developerId: req.userId
    }
  });

  return NextResponse.json(
    { availableContracts: getAllContractsDetails(), myContracts },
    { status: StatusCodes.OK },
  );
}

export const GET = withDevUserApiToken(getHandler);