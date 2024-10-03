import { developersUserAccountModel } from "@/models";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sendVerificationEmailCode } from "@/lib/emails/auth/sendVerificationEmailCode";
import { withApiToken } from "@/app/middleware/withApiToken";

async function handler(req: NextRequestWithApiToken) {
  const body = await req.json();
  const { email } = body;

  const userData = await developersUserAccountModel.findUnique({
    where: {
      email,
      appId: req.appId,
      developerId: req.developerId
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

export const POST = withApiToken(handler);