import nodemailer from "nodemailer";
import { createMailTransport } from "@/lib/emails/transporter";

type SendEmailParams = {
  recipientEmail: string;
  subject: string;
  emailHtml: string;
  isLocalhost: boolean;
};

export async function sendEmail({ recipientEmail, subject, emailHtml, isLocalhost }: SendEmailParams) {
  const transporter = await createMailTransport(isLocalhost);

  const options = {
    from: process.env.SMTP_EMAIL || "test@blessed.fan",
    to: recipientEmail,
    subject: subject,
    html: emailHtml
  };

  const sendResult = await transporter.sendMail(options);

  if (isLocalhost) {
    console.log(`📨 Email sent. Preview URL: ${nodemailer.getTestMessageUrl(sendResult)}`);
  }

  return sendResult;
}
