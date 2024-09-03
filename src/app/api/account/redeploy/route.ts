import { NextResponse } from "next/server";
import { withDevAuth } from "@/app/middleware/withDevAuth";
import { redeployDevAccount } from "@/server/api/accounts/redeployAccount";
import { StatusCodes } from "http-status-codes";

async function handler(req: NextRequestWithDevAuth) {
  const result = await redeployDevAccount(req.developerId);

  return NextResponse.json(
    { result },
    {
      status: StatusCodes.OK,
    },
  );
}

export const POST = withDevAuth(handler);
