import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppParam } from "@/app/middleware/withAppParam";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppParam) {
  const { appId } = req;

  const smartContracts = await smartContractModel.findMany({
    where: {
      appId
    }
  });
  return NextResponse.json(smartContracts, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(withAppParam(getHandler));
