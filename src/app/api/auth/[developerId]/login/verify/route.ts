import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmail } from "@/server/auth/verifyEmail";
import { createOrUpdateSession } from "@/server/auth/session";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";

async function handler(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, {
      status: StatusCodes.BAD_REQUEST,
    } as any);
  }

  const verifyEmailResult = await verifyEmail(code, "user");
  const { accepted, email } = verifyEmailResult;

  if (accepted && email) {
    const newSessionData = await createOrUpdateSession(email, "user");

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
export const POST = withExistingDevAccount(handler);
