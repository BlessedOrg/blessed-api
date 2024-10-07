import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withUserAccessToken } from "@/app/middleware/withUserAccessToken";
import { userSessionModel } from "@/models";

async function postHandler(req: NextRequestWithUserAccessToken) {
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

export const POST = withUserAccessToken(postHandler);