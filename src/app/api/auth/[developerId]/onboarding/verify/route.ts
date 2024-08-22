import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developersUserAccountModel } from "@/prisma/models";
import { createAndDeployAccount } from "@/server/createAndDeployAccount";
import { verifyEmail } from "@/server/auth/verifyEmail";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";

async function handler(req: Request, { params: { developerId } }) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const verifyEmailResult = await verifyEmail(code, "user");
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
    },
  });

  if (createdUser) {
    const {
      accessToken,
      refreshToken,
    } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, "user");

    const deployedUserAccount: any = await createAndDeployAccount(createdUser?.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);
    if (deployedUserAccount?.contractAddress) {
      await developersUserAccountModel.update({
        where: {
          email,
        },
        data: {
          walletAddress: deployedUserAccount.contractAddress,
          accountDeployed: true,
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
    } else {
      await developersUserAccountModel.update({
        where: {
          email,
        },
        data: {
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
    }

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          developerId,
          isDeployed: !!deployedUserAccount?.contractAddress,
          walletAddress: deployedUserAccount?.contractAddress,
          vaultKey: deployedUserAccount?.vaultKey,
          verifyEmailResult,
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