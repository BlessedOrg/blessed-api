import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/prisma/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

async function getHandler(req: NextRequestWithDeveloperAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const smartContracts = await smartContractModel.findMany({
    where: {
      appSlug
    }
  });
  return NextResponse.json(smartContracts, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
