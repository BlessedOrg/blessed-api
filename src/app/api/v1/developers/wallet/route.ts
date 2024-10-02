import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { developerAccountModel } from "@/prisma/models";

async function handler(req: NextRequestWithDeveloperAccessToken) {
  const developerData = await developerAccountModel.findUnique({ where: { id: req.developerId }, select: { walletAddress: true } });

  return NextResponse.json(developerData, {
    status: StatusCodes.OK
  });
}

export const GET = withDeveloperAccessToken(handler);

