import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAccountData } from "@/server/api/accounts/getAccountInstance";

async function handler(req: NextRequestWithDeveloperAccessToken) {
  const accountData = await getAccountData({ developerId: req.developerId });

  return NextResponse.json(
    accountData,
    { status: StatusCodes.OK }
  );
}

export const GET = withDeveloperAccessToken(handler);
