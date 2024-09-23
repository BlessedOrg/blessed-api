"use server";
import nodeMailer from "nodemailer";
import { generateOTP } from "@/utils/generateOtp";
import { emailVerificationCodeModel } from "@/prisma/models";
import { createMailTransport } from "@/server/api/email";
import { render } from "@react-email/components";
import { VerificationCodeEmail } from "@/emailTemplates/VerificationCodeEmail";

type VerificationEmailParams = {
  to: string;
  expirationTimeMinutes?: number;
  isLocalhost: boolean;
};

export async function sendVerificationEmailCode({ to, expirationTimeMinutes, isLocalhost }: VerificationEmailParams) {
  const transport = await createMailTransport(isLocalhost);

  const code = generateOTP();

  const createCodeRecord = await emailVerificationCodeModel.create({
    data: {
      code,
      email: to,
      expiresAt: !!expirationTimeMinutes
        ? new Date(Date.now() + expirationTimeMinutes * 60 * 1000)
        : new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });
  if (createCodeRecord) {
    console.log(`📧 Created verification code record:`, createCodeRecord.code);
  }
  try {
    const emailHtml = await render(<VerificationCodeEmail code={code} />);
    const sendResult = await transport.sendMail({
      from: process.env.SMTP_EMAIL || "test@blessed.fan",
      to,
      subject: "Verification code",
      html: emailHtml,
    });

    if (isLocalhost) {
      console.log(`📨 Email sent. Preview URL: ${nodeMailer.getTestMessageUrl(sendResult)}`);
    }

    return sendResult;
  } catch (e) {
    console.log(e);
  }
}
