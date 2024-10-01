import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/prisma/models";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { sessionType } from "@prisma/client";
import { importUserToPrivy } from "@/server/auth/importUserToPrivy";

export const maxDuration = 300;

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const verifyEmailResult = await verifyEmailOtp(code);
  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  console.log(1)
  const privyUser = await importUserToPrivy(email)
  console.log(2)
  const createdUser: any = await developerAccountModel.create({
    data: {
      email,
      walletAddress: privyUser.wallet.address
    },
  });
console.log(3)
  if (createdUser) {
    const {
      accessToken,
      refreshToken
    } = await createSessionTokens({ id: createdUser?.id });

    await createOrUpdateSession(email, sessionType.dev);

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          walletAddress: privyUser.wallet.address,
          verifyEmailResult,
          id: createdUser.id
        },
      },
      { status: StatusCodes.OK },
    );
  }

  return NextResponse.json(
    { error: "Failed to create user" },
    { status: StatusCodes.INTERNAL_SERVER_ERROR });
}