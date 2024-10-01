import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
import { createOrUpdateSession } from "@/server/auth/session";
import { sessionType } from "@prisma/client";
import { developerAccountModel } from "@/prisma/models";
import { importUserToPrivy } from "@/server/auth/importUserToPrivy";
import { createSessionTokens } from "@/server/auth/createSessionTokens";

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, {
      status: StatusCodes.BAD_REQUEST
    } as any);
  }

  const verifyEmailResult = await verifyEmailOtp(code);
  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const developerExists = await developerAccountModel.findUnique({ where: { email } });
  if (!developerExists) {
    const privyUser = await importUserToPrivy(email);
    const createdDeveloperAccount: any = await developerAccountModel.create({
      data: {
        email,
        walletAddress: privyUser.wallet.address
      }
    });

    if (createdDeveloperAccount) {
      const {
        accessToken,
        refreshToken
      } = await createSessionTokens({ id: createdDeveloperAccount?.id });

      await createOrUpdateSession(email, sessionType.dev);

      return NextResponse.json(
        {
          accessToken,
          refreshToken,
          developer: {
            email,
            walletAddress: privyUser.wallet.address,
            id: createdDeveloperAccount.id
          },
          message: "Account created successfully"
        },
        { status: StatusCodes.OK }
      );
    }
  } else {
    if (accepted && email) {
      const newSessionData = await createOrUpdateSession(email, sessionType.dev);

      if (newSessionData?.error) {
        return NextResponse.json(
          {
            error: "Failed to create or update session",
            message: newSessionData.error
          },
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR
          }
        );
      }

      return NextResponse.json(
        {
          accessToken: newSessionData.accessToken,
          refreshToken: newSessionData.refreshToken,
          developer: {
            walletAddress: developerExists.walletAddress,
            id: developerExists.id
          },
          message: "Logged in successfully"
        },
        {
          status: StatusCodes.OK
        }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid code", message: verifyEmailResult.message },
        {
          status: StatusCodes.BAD_REQUEST
        }
      );
    }
  }

}
