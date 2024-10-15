import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
  const { appId } = req;

  const smartContracts = await smartContractModel.findMany({
    where: {
      appId
    }
  });
  return NextResponse.json(smartContracts, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(withAppValidate(getHandler));
