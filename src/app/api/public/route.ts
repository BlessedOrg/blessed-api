import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAllContractsDetails } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequestWithApiTokenAuth) {
  const myContracts = await smartContractModel.findMany({
    where: {
      developerId: req.developerId,
    },
  });

  return NextResponse.json({ availableContracts: getAllContractsDetails(), myContracts }, { status: StatusCodes.OK });
}

export const GET = withDeveloperApiToken(getHandler);
