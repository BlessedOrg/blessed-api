import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppParam } from "@/app/middleware/withAppParam";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppParam) {
  const targetApp = await appModel.findUnique({
    where: {
      id: req.appId
    },
    include: {
      _count: {
        select: {
          SmartContracts: true,
          Users: true
        }
      }
    }
  });

  if (!targetApp) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  return NextResponse.json(targetApp, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(withAppParam(getHandler));
