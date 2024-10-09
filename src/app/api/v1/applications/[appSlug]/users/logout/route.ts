import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { userSessionModel } from "@/models";
import { withApiKeyAndUserAccessToken } from "@/app/middleware/withApiKeyAndUserAccessToken";

async function postHandler(req: NextRequestWithApiKeyAndUserAccessToken) {
  await userSessionModel.updateMany({
    where: {
      userId: req.userId
    },
    data: {
      expiresAt: new Date()
    }
  });

  return NextResponse.json({ message: "Successfully logged out" }, {
    status: StatusCodes.OK
  });
}

export const POST = withApiKeyAndUserAccessToken(postHandler);