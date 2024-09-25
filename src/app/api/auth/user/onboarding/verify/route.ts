import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developersUserAccountModel } from "@/prisma/models";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { createAndDeployAccount, updateAccountModel } from "@/server/api/accounts/createAndDeployAccount";
import { sessionType } from "@prisma/client";
import { withApiToken } from "@/app/middleware/withApiToken";

export const maxDuration = 300;

async function handler(req: NextRequestWithApiToken) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const verifyEmailResult = await verifyEmailOtp(code);
  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const createdUser: any = await developersUserAccountModel.create({
    data: {
      email,
      developerId: req.developerId,
      appId: req.appId
    },
  });

  if (createdUser) {
    const { accessToken, refreshToken } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, sessionType.user);

    const deployedUserAccount: any = await createAndDeployAccount(createdUser?.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);

    const newRecordId = await updateAccountModel(email, deployedUserAccount);

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          developerId: req.developerId,
          isDeployed: deployedUserAccount?.contractAddress,
          walletAddress: deployedUserAccount?.contractAddress,
          vaultKey: deployedUserAccount?.vaultKey,
          verifyEmailResult,
          id: newRecordId
        },
      },
      { status: StatusCodes.OK },
    );
  }

  return NextResponse.json(
    { error: "Failed to create user" },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
export const POST = withApiToken(handler);