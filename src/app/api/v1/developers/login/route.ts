import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sendVerificationEmailCode } from "@/server/auth/sendVerificationEmailCode";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  const otpCodeSent = await sendVerificationEmailCode({
    to: email,
    expirationTimeMinutes: 2,
    isLocalhost: req.nextUrl.hostname === "localhost",
  });

  if (otpCodeSent) {
    return NextResponse.json({ message: "Verification code sent successfully" }, {
      status: StatusCodes.OK,
    });
  } else {
    return NextResponse.json({ error: "Failed to send verification code email." }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}