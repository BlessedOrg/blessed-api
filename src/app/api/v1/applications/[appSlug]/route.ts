import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const targetApp = await appModel.findUnique({
    where: {
      slug: appSlug
    },
    select: {
      id: true
    }
  });

  if (!targetApp) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const app = await appModel.findUnique({
    where: {
      id: targetApp.id
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

  if (!app) {
    return NextResponse.json({ error: `App not found` }, { status: StatusCodes.NOT_FOUND });
  }

  return NextResponse.json(app, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(getHandler);
