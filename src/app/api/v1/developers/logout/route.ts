import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { developerSessionModel } from "@/models";
import { updateVaultItem } from "@/lib/1pwd-vault";

async function postHandler(req: NextRequestWithDeveloperAccessToken) {
  await developerSessionModel.updateMany({
    where: {
      developerId: req.developerId
    },
    data: {
      expiresAt: new Date()
    }
  });

  const deletedToken = await updateVaultItem(req.accessTokenVaultKey, [
    {
      op: "replace",
      path: "/fields/accessToken/value",
      value: "none"
    }
  ], "accessToken");
  if (deletedToken?.id) {
    return NextResponse.json({ message: "Successfully logged out" }, {
      status: StatusCodes.OK
    });
  } else {
    return NextResponse.json({ error: "Failed to log out" }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}
export const POST = withDeveloperAccessToken(postHandler);
