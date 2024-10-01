import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel } from "@/prisma/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

async function getHandler(req: NextRequestWithDeveloperAccessToken, { params: { id } }) {
  if (!id) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const app = await appModel.findUnique({
    where: {
      id
    },
    include: {
      _count: {
        select: {
          SmartContracts: true,
          ApiTokens: true,
          Users: true
        },
      },
    },
  });

  if (!app) {
    return NextResponse.json({ error: `App not found` }, { status: StatusCodes.NOT_FOUND });
  }

  return NextResponse.json(app, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
