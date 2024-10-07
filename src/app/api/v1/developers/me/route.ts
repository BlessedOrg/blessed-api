import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { developerAccountModel } from "@/models";

async function getHandler(req: NextRequestWithDeveloperAccessToken) {
  const devData = await developerAccountModel.findUnique({
    where: {
      id: req.developerId
    }
  });

  return NextResponse.json(devData, {
    status: StatusCodes.OK
  });
}

export const GET = withDeveloperAccessToken(getHandler);
