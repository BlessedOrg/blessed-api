import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { validateEmail } from "@/server/auth/validateEmail";
import { sendVerificationEmailCode } from "@/server/auth/sendVerificationEmailCode";
import { sessionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const isEmailTaken: boolean = await validateEmail(email, sessionType.dev);

    if (isEmailTaken) {
      return NextResponse.json(
        { error: "Email already taken" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const res = await sendVerificationEmailCode({
      to: email,
      isLocalhost: req.nextUrl.hostname === "localhost",
    });
    if (isEmailTaken) {
      return NextResponse.json({ message: "Email is already taken!" }, { status: StatusCodes.BAD_REQUEST });
    }
    if (!isEmailTaken && res) {
      return NextResponse.json({ message: "Verification code sent." }, { status: StatusCodes.OK });
    }

    return NextResponse.json({ error: "Failed to send verification code email." }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    } as any);
  } catch (error) {
    console.log(`🚨 Error on ${req.nextUrl.pathname}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
  }
}
