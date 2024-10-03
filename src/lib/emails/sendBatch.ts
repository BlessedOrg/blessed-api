import nodemailer from "nodemailer";
import { createMailTransport } from "@/lib/emails/transporter";

interface EmailData {
  recipientEmail: string;
  subject: string;
  html: string;
}

export async function sendBatchEmails(emailDataArray: EmailData[], isLocalhost: boolean) {
  const transporter = await createMailTransport(isLocalhost);

  const emailPromises = emailDataArray.map(({ recipientEmail, subject, html }) => {
    const options = {
      from: process.env.SMTP_EMAIL || "test@blessed.fan",
      to: recipientEmail,
      subject: subject,
      html: html
    };

    return transporter.sendMail(options);
  });

  const sendResults = await Promise.all(emailPromises);

  if (isLocalhost) {
    sendResults.forEach((result, index) => {
      console.log(`📨 Email ${index + 1} sent. Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
    });
  }

  return sendResults;
}