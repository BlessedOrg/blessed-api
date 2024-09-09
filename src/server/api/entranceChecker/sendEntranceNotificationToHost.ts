"use server";
import nodeMailer from "nodemailer";
import { developerAccountModel, smartContractModel } from "@/prisma/models";

type EmailParams = {
  contractAddress: string;
  isLocalhost: boolean;
  userData: {
    email: string;
    walletAddress: string;
  };
};

export async function sendEntranceNotificationToHost({
  contractAddress,
  isLocalhost,
  userData,
}: EmailParams) {
  const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  if (!isLocalhost && (!SMTP_PASSWORD || !SMTP_EMAIL)) {
    throw new Error("SMTP_PASSWORD or SMTP_EMAIL is not set");
  }

  const { developerId } = await smartContractModel.findFirst({
    where: { address: contractAddress },
    select: { developerId: true },
  });

  const devData = await developerAccountModel.findUnique({
    where: { id: developerId },
  });

  let transport;
  if (isLocalhost) {
    const testAccount = await nodeMailer.createTestAccount();
    transport = nodeMailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transport = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });
  }

  try {
    const testResult = await transport.verify();
    if (!testResult) {
      throw new Error("Email service is not ready");
    }
  } catch (err) {
    console.log(err);
    return;
  }

  try {
    const sendResult = await transport.sendMail({
      from: SMTP_EMAIL || "test@blessed.fan",
      to: devData.email,
      subject: "New event member",
      html: notificationCodeTemplate(userData),
    });

    if (isLocalhost) {
      console.log(`📨 Email sent. Preview URL: ${nodeMailer.getTestMessageUrl(sendResult)}`);
    }

    return sendResult;
  } catch (e) {
    console.log(e);
  }
}

const notificationCodeTemplate = (userData: EmailParams["userData"]) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hey someone joined to the Event</title>
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
        <div class="header">New member joined to event</div>
        <div class="content">
          <p>Hi,</p>
          <p>New member details:</p>
          <div class="code">Email: ${userData.email}</div>
          <div class="code">Wallet Address: ${userData.walletAddress}</div>
          <p>Please enter this code to verify your account.</p>
        </div>
        <div class="footer">
          <p>Enjoy</p>
        </div>
      </div>
    </body>
    </html>
  `;
