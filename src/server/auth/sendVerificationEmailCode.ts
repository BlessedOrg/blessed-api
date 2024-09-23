"use server";
import nodeMailer from "nodemailer";
import { generateOTP } from "@/utils/generateOtp";
import { emailVerificationCodeModel } from "@/prisma/models";
import { createMailTransport } from "@/server/api/email";

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
    const sendResult = await transport.sendMail({
      from: process.env.SMTP_EMAIL || "test@blessed.fan",
      to,
      subject: "Verification code",
      html: verificationCodeTemplate(`${code}`),
    });

    if (isLocalhost) {
      console.log(`📨 Email sent. Preview URL: ${nodeMailer.getTestMessageUrl(sendResult)}`);
    }

    return sendResult;
  } catch (e) {
    console.log(e);
  }
}

const verificationCodeTemplate = (code: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
        }
        .header {
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          text-align: center;
          margin-bottom: 20px;
        }
        .content {
          font-size: 16px;
          color: #555555;
          line-height: 1.5;
          text-align: center;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #ff6f61;
          margin: 20px 0;
        }
        .footer {
          font-size: 14px;
          color: #777777;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Your verification code</div>
        <div class="content">
          <p>Hi,</p>
          <p>Your verification code is:</p>
          <div class="code">${code}</div>
          <p>Please enter this code to verify your account.</p>
        </div>
        <div class="footer">
          <p>If you didn't ask for this code, please ignore this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
