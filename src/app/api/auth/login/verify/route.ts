import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmailOtp } from "@/server/auth/verifyEmailOtp";
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

  if (accepted && email) {
    const newSessionData = await createOrUpdateSession(email, sessionType.dev);

    if (newSessionData?.error) {
      return NextResponse.json(
        {
          error: "Failed to create or update session",
          message: newSessionData.error,
        },
        {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        },
      );
    }

    return NextResponse.json(
      { message: "Verified successfully", newSessionData },
      {
        status: StatusCodes.OK,
      },
    );
  } else {
    return NextResponse.json(
      { error: "Invalid code", message: verifyEmailResult.message },
      {
        status: StatusCodes.BAD_REQUEST,
      },
    );
  }
}
