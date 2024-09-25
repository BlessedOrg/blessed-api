import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developersUserAccountModel } from "@/prisma/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

async function getHandler(req: NextRequestWithDevAuth, { params: { id } }) {
  if (!id) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const users = await developersUserAccountModel.findMany({
    where: {
      appId: id
    }
  });
  return NextResponse.json(users, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
