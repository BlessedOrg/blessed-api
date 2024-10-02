import { NextResponse } from "next/server";
import { withDeveloperUserAccessToken } from "@/app/middleware/withDeveloperUserAccessToken";
// import { redeployDevAccount } from "@/server/api/accounts/redeployAccount";
import { StatusCodes } from "http-status-codes";

async function handler(req: NextRequestWithDeveloperUserAccessToken) {
  // const result = await redeployDevAccount(req.userId, 'user');

  return NextResponse.json(
    // { result },
    {
      status: StatusCodes.OK,
    },
  );
}

export const POST = withDeveloperUserAccessToken(handler);
