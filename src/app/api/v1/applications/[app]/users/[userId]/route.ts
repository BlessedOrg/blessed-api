import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKey } from "@/app/middleware/withApiKey";
import { userModel } from "@/models";

async function getHandler(req: NextRequestWithApiKey, { params: { userId } }) {
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const userData = await userModel.findUnique({ where: { id: userId } });

  return NextResponse.json(userData, {
    status: StatusCodes.OK
  });
}

export const GET = withApiKey(getHandler);

