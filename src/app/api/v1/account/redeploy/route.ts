import { NextResponse } from "next/server";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
// import { redeployDevAccount } from "@/server/api/accounts/redeployAccount";
import { StatusCodes } from "http-status-codes";

async function handler(req: NextRequestWithDeveloperAccessToken) {
  // const result = await redeployDevAccount(req.developerId);

  return NextResponse.json(
    // { result },
    {
      status: StatusCodes.OK,
    },
  );
}

export const POST = withDeveloperAccessToken(handler);
