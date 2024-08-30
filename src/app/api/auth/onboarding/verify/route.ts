import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/prisma/models";
import { createAndDeployAccount } from "@/server/createAndDeployAccount";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { sessionType } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, {
      status: StatusCodes.BAD_REQUEST,
    } as any);
  }

  const verifyEmailResult = await verifyEmailOtp(code);
  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json({ error: "Invalid code", verifyEmailResult }, {
      status: StatusCodes.BAD_REQUEST,
    } as any);
  }

  const createdUser: any = await developerAccountModel.create({
    data: {
      email,
    },
  });

  if (createdUser) {
    const {
      accessToken,
      refreshToken
    } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, sessionType.dev);

    const deployedUserAccount: any = await createAndDeployAccount(createdUser.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);

    let newRecordId: string;
    if (deployedUserAccount?.contractAddress) {
      const dev = await developerAccountModel.update({
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
      const devUser = await developerAccountModel.update({
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
          isDeployed: !!deployedUserAccount?.contractAddress,
          walletAddress: deployedUserAccount?.contractAddress,
          vaultKey: deployedUserAccount?.vaultKey,
          verifyEmailResult,
          id: newRecordId
        },
      },
      { status: StatusCodes.OK } as any,
    );
  }

  return NextResponse.json(
    { error: "Failed to create user" },
    { status: StatusCodes.INTERNAL_SERVER_ERROR });
}