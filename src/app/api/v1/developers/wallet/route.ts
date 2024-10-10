import { developerAccountModel } from "@/models";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";

async function handler(req: NextRequestWithApiKeyOrDevAccessToken) {
  const developerData = await developerAccountModel.findUnique({ where: { id: req.developerId }, select: { walletAddress: true } });

  return NextResponse.json(developerData, {
    status: StatusCodes.OK
  });
}

export const GET = withApiKeyOrDevAccessToken(handler);

