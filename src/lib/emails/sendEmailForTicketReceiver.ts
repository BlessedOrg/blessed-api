"use server";
import nodeMailer from "nodemailer";
import { generateOTP } from "@/utils/generateOtp";
import { emailVerificationCodeModel } from "@/models";
import { createMailTransport } from "@/lib/emails/transporter";


type VerificationEmailParams = {
  to: string;
  url: string;
  isLocalhost: boolean;
};

export async function sendEmailForTicketReceiver({ to, url, isLocalhost }: VerificationEmailParams) {
  const transport = await createMailTransport(isLocalhost);
  const testResult = await transport.verify();
  if (!testResult) {
    throw new Error("Email service is not ready");
  }

  try {
    const sendResult = await transport.sendMail({
      from: process.env.SMTP_EMAIL || "test@blessed.fan",
      to,
      subject: "Verification code",
      html: ""
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


