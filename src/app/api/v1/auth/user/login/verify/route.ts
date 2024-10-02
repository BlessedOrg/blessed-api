import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmailOtp } from "@/lib/emails/auth/verifyEmailOtp";
import { createOrUpdateSession } from "@/lib/auth/session";
import { sessionType } from "@prisma/client";
import { withApiToken } from "@/app/middleware/withApiToken";

async function handler(req: NextRequestWithApiToken) {
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

  if (accepted && email) {
    const newSessionData = await createOrUpdateSession(email, sessionType.user);

    if (newSessionData?.error) {
      return NextResponse.json(
        {
          error: "Failed to create or update session",
          message: newSessionData.error
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json(
      { message: "Verified successfully", newSessionData },
      { status: StatusCodes.OK }
    );
  } else {
    return NextResponse.json(
      { error: "Invalid code", message: verifyEmailResult.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const POST = withApiToken(handler);
