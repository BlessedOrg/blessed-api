import { developersUserAccountModel } from "@/prisma/models";
import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sendVerificationEmailCode } from "@/server/auth/sendVerificationEmailCode";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";

async function handler(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  const userData = await developersUserAccountModel.findUnique({
    where: {
      email,
    },
  });

  if (!userData) {
    return NextResponse.json({ error: "User not found" }, {
      status: StatusCodes.NOT_FOUND,
    });
  }

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

export const POST = withExistingDevAccount(handler);