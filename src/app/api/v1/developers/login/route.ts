import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { generateEmailVerificationCode } from "@/lib/auth/emailVerificationCode";
import { sendEmail } from "@/lib/emails/send";
import renderVerificationCodeEmail from "@/lib/emails/templates/VerificationCodeEmail";
import { EmailSchema } from "@/lib/zodSchema";

export async function POST(req: NextRequest) {
  const validBody = EmailSchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  const { email } = validBody.data;

  const otpCode = await generateEmailVerificationCode({
    to: email,
    expirationTimeMinutes: 2,
    isLocalhost: req.nextUrl.hostname === "localhost"
  });

  const sentEmail = await sendEmail({
    recipientEmail: email,
    subject: "Your One-Time Password for Blessed.fan",
    emailHtml: await renderVerificationCodeEmail({ otp: otpCode.code }),
    isLocalhost: req.nextUrl.hostname === "localhost"
  });

  if (otpCode && sentEmail) {
    return NextResponse.json({ message: "Verification code sent successfully" }, {
      status: StatusCodes.OK
    });
  } else {
    return NextResponse.json({ error: "Failed to send verification code email." }, {
      status: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
}