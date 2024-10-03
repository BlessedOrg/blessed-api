import nodeMailer from "nodemailer";

export const createMailTransport = async (isLocalhost: boolean) => {
  const { SMTP_PASSWORD, SMTP_EMAIL, SMTP_HOST, SMTP_PORT } = process.env;

  if (!isLocalhost && (!SMTP_PASSWORD || !SMTP_EMAIL || !SMTP_HOST || !SMTP_PORT)) {
    throw new Error(`You need to provide all SMTP related environment variables - SMTP_PASSWORD, SMTP_EMAIL, SMTP_HOST, SMTP_PORT.`);
  }

  let transport;
  if (isLocalhost) {
    const testAccount = await nodeMailer.createTestAccount();
    transport = nodeMailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass:  testAccount.pass,
      },
    });
  } else {
    transport = nodeMailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT as any,
      secure: false,
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });
  }


  const testResult = await transport.verify();
  if (!testResult) {
    throw new Error("Email service is not ready");
  }
  return transport;
  // try {
  // } catch (err) {
  //   console.log(err);
  //   return;
  // }
};