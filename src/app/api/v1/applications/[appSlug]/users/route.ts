import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel, developersUserAccountModel } from "@/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { getAppIdBySlug } from "@/lib/app";

async function getHandler(req: NextRequestWithDeveloperAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const app = await getAppIdBySlug(appSlug)
  if (!app) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const users = await developersUserAccountModel.findMany({
    where: {
      appId: app.id
    }
  });
  return NextResponse.json(users, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
