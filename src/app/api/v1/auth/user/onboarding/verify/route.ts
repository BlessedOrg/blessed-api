import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developersUserAccountModel } from "@/prisma/models";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { sessionType } from "@prisma/client";
import { withApiToken } from "@/app/middleware/withApiToken";
import { importUserToPrivy } from "@/server/auth/importUserToPrivy";

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
  const privyUser = await importUserToPrivy(email)
  const createdUser: any = await developersUserAccountModel.create({
    data: {
      email,
      developerId: req.developerId,
      appId: req.appId,
      walletAddress: privyUser.wallet.address,
    },
  });

  if (createdUser) {
    const { accessToken, refreshToken } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, sessionType.user);

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          developerId: req.developerId,
          walletAddress: privyUser.wallet.address,
          verifyEmailResult,
          id: createdUser.id,
          appId: req.appId
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