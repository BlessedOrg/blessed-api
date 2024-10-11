import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken) {
  const devData = await developerAccountModel.findUnique({
    where: {
      id: req.developerId
    }
  });

  return NextResponse.json(devData, {
    status: StatusCodes.OK
  });
}

export const GET = withApiKeyOrDevAccessToken(getHandler);
