import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developersUserAccountModel } from "@/prisma/models";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { createAndDeployAccount } from "@/server/api/accounts/createAndDeployAccount";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";
import { sessionType } from "@prisma/client";

export const maxDuration = 300;

async function handler(req: Request, { params: { developerId, appId } }) {
  console.log("🔥 appId: ", appId)
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
      developerId: developerId,
      appId
    },
  });

  if (createdUser) {
    const { accessToken, refreshToken } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, sessionType.user);

    const deployedUserAccount: any = await createAndDeployAccount(createdUser?.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);

    let newRecordId: string;
    if (deployedUserAccount?.contractAddress) {
      const dev = await developersUserAccountModel.update({
        where: {
          email,
        },
        data: {
          walletAddress: deployedUserAccount.contractAddress,
          accountDeployed: true,
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
      newRecordId = dev?.id;
    } else {
      const devUser = await developersUserAccountModel.update({
        where: {
          email,
        },
        data: {
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
      newRecordId = devUser?.id;
    }

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          developerId,
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
export const POST = withExistingDevAccount(handler);