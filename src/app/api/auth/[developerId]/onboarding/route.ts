import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { validateEmail } from "@/server/auth/validateEmail";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";
import { sendVerificationEmailCode } from "@/server/auth/sendVerificationEmailCode";
import { sessionType } from "@prisma/client";

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const isEmailTaken: any = await validateEmail(email, sessionType.user);
    
    const res = await sendVerificationEmailCode({
      to: email,
      isLocalhost: req.nextUrl.hostname === "localhost",
    });

    if (!isEmailTaken && res) {
      return NextResponse.json(
        { message: "Verification code sent." },
        { status: StatusCodes.OK },
      );
    }

    return NextResponse.json(
      { error: "Failed to send verification code email." },
      { status: StatusCodes.INTERNAL_SERVER_ERROR } as any,
    );
  } catch (error) {
    console.log(`🚨 Error on ${req.nextUrl.pathname}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
  }
}

export const POST = withExistingDevAccount(handler);