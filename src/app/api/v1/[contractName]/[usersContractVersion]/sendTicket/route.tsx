import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { gaslessTransactionWithFallback } from "@/server/gaslessTransactionWithFallback";
import provider from "@/contracts/cairo/provider";
import { getContractsFunctions } from "@/contracts/cairo/interfaces";
import { developersUserAccountModel, smartContractModel } from "@/prisma/models";
import { getAccountInstance } from "@/server/api/accounts/getAccountInstance";
import connectToContract from "@/server/services/connectToContract";
import { withApiToken } from "@/app/middleware/withApiToken";
import { withDeveloperUserAccessToken } from "@/app/middleware/withDeveloperUserAccessToken";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { createOrUpdateSession } from "@/server/auth/session";
import { sessionType } from "@prisma/client";
import { createAndDeployAccount, updateAccountModel } from "@/server/api/accounts/createAndDeployAccount";
import { validateEmail } from "@/server/auth/validateEmail";
import { createMailTransport } from "@/server/api/email";
import { render } from "@react-email/components";
import nodeMailer from "nodemailer";
import TicketReceiverEmail from "@/emailTemplates/TicketReceiverEmail";

const schema = z.object({
  email: z.string().email()
});

async function postHandler(req: NextRequestWithApiToken, { params: { contractName, usersContractVersion } }) {
  const isLocalhost = req.nextUrl.hostname === "localhost";
  const validBody = schema.safeParse(await req.json());
  if (!validBody.success) {
    throw new Error(`${validBody.error}`);
  }
  const { email } = validBody.data;

  const { account } = await getAccountInstance({ developerId: req.developerId });

  const smartContract = await smartContractModel.findFirst({
    where: {
      developerId: req.developerId,
      version: Number(usersContractVersion),
      name: contractName
    },
    include: {
      App: true
    }
  });
  if (!smartContract) {
    return NextResponse.json(
      {
        error: `Wrong parameters. Smart contract ${contractName} v${usersContractVersion} from User ${req.userId} not found.`
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const contract = connectToContract({
    address: smartContract?.address,
    name: contractName
  });

  const isEmailTaken: boolean = await validateEmail(email, sessionType.user);

  let user;
  if (isEmailTaken) {
    user = await developersUserAccountModel.findUnique({
      where: {
        email
      },
      select: {
        email: true,
        walletAddress: true
      }
    });
  } else {
    user = await developersUserAccountModel.create({
      data: {
        email,
        developerId: req.developerId,
        appId: req.appId
      },
      select: {
        email: true,
        walletAddress: true
      }
    });
    await createSessionTokens({ id: user?.id });
    await createOrUpdateSession(email, sessionType.user);
    const deployedUserAccount: any = await createAndDeployAccount(user?.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);
    await updateAccountModel(email, deployedUserAccount);
    user.walletAddress = deployedUserAccount.contractAddress;
  }

  const transactionResult = await gaslessTransactionWithFallback(
    account,
    "send",
    contract,
    { to: user.walletAddress },
    getContractsFunctions(contractName),
    false
  );

  await provider.waitForTransaction(transactionResult?.txHash);

  const transporter = await createMailTransport(isLocalhost);
  const emailHtml = await render(
    <TicketReceiverEmail
      eventName={smartContract?.App?.name}
      ticketUrl={transactionResult?.txHash}
      imageUrl={(smartContract.metadataPayload as { metadataImageUrl?: string })?.metadataImageUrl ?? null}
    />
  );
  const options = {
    from: process.env.SMTP_EMAIL || "test@blessed.fan",
    to: user.email,
    subject: `Your ticket to ${smartContract?.App?.name}!`,
    html: emailHtml
  };
  const sendResult = await transporter.sendMail(options);
  if (isLocalhost) {
    console.log(`📨 Email sent. Preview URL: ${nodeMailer.getTestMessageUrl(sendResult)}`);
  }

  if (!!transactionResult.error) {
    return NextResponse.json({ result: transactionResult }, { status: StatusCodes.BAD_REQUEST });
  }

  return NextResponse.json({ result: transactionResult }, { status: StatusCodes.OK });
}

export const POST = withApiToken(withDeveloperUserAccessToken(postHandler));

export const maxDuration = 300;
