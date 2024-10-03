import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { validateEmail } from "@/lib/emails/auth/validateEmail";
import { sendVerificationEmailCode } from "@/lib/emails/auth/sendVerificationEmailCode";
import { sessionType } from "@prisma/client";
import { withApiToken } from "@/app/middleware/withApiToken";

async function postHandler(req: NextRequestWithApiToken) {
  try {
    const body = await req.json();
    const { email } = body;

    const isEmailTaken: boolean = await validateEmail(email, sessionType.user);

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

export const POST = withApiToken(postHandler);
