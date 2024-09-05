import { NextResponse } from "next/server";
import { redeployDevAccount } from "@/server/api/accounts/redeployAccount";
import { StatusCodes } from "http-status-codes";
import {withDeveloperUserAccessToken} from "@/app/middleware/withDeveloperUserAccessToken";

async function handler(req: NextRequestWithDevUserAuth) {
  const result = await redeployDevAccount(req.userId, 'user');

  return NextResponse.json(
    { result },
    {
      status: StatusCodes.OK,
    },
  );
}

export const POST = withDeveloperUserAccessToken(handler);
