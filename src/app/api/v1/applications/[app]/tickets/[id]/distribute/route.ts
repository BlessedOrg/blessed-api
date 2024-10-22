import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl } from "@/lib/viem";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import renderTicketReceiverEmail from "@/lib/emails/templates/TicketReceiverEmail";
import { sendBatchEmails } from "@/lib/emails/sendBatch";
import { parseEventLogs } from "viem";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";
import { PrefixedHexString } from "ethereumjs-util";
import { biconomyMetaTx } from "@/lib/biconomy";

const DistributeSchema = z.object({
  distributions: z.array(
    z.object({
      email: z.string().email(),
      amount: z.number().int().positive()
    })
  )
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate & NextRequestWithTicketValidate) {
  console.time("distribute");
  const { appId, appSlug, appName, appImageUrl, ticketId, ticketContractAddress } = req;
  try {
    const validBody = DistributeSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const { users } = await createMissingAccounts(validBody.data.distributions.map(distribution => distribution.email), appId);
    console.log("🌳 users: ", users)
    const emailToWalletMap = new Map(users.map(account => [account.email, {
      smartWalletAddress: account.smartWalletAddress,
      walletAddress: account.walletAddress,
      id: account.id }
    ]));
    const distribution = validBody.data.distributions.map(distribution => {
      const mappedUser = emailToWalletMap.get(distribution.email);
      if (mappedUser) {
        return {
          userId: mappedUser.id,
          email: distribution.email,
          walletAddr: mappedUser.walletAddress,
          smartWalletAddr: mappedUser.smartWalletAddress,
          amount: distribution.amount,
          tokenIds: []
        };
      }
      return null;
    }).filter((item) => item !== null);

    const metaTxResult = await biconomyMetaTx({
      contractAddress: ticketContractAddress as PrefixedHexString,
      contractName: "tickets",
      functionName: "distribute",
      args: [distribution.map(dist => [dist.smartWalletAddr, dist.amount])],
      capsuleTokenVaultKey: req.capsuleTokenVaultKey,
      userWalletAddress: req.appOwnerWalletAddress
    });

    console.log("🔮 metaTxResult: ", metaTxResult)

    if (metaTxResult.error) {
      return NextResponse.json(
        { success: false, error: metaTxResult.error },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const logs = parseEventLogs({
      abi: contractArtifacts["tickets"].abi,
      logs: metaTxResult.data.transactionReceipt.logs
    });

    const transferSingleEventArgs = logs
      .filter(log => (log as any) !== "TransferSingle")
      .map((log) => (log as any)?.args);

    transferSingleEventArgs.forEach((args) => {
      const matchingRecipient = distribution
        .find(d => d.smartWalletAddr.toLowerCase() == args.to.toLowerCase());
      if (matchingRecipient) {
        matchingRecipient.tokenIds.push(args.id.toString());
      }
    });

    const emailsToSend = await Promise.all(
      distribution.map(async (dist: any) => {
        const ticketUrls = dist.tokenIds.map((tokenId) =>
          `https://blessed.fan/show-ticket?app=${appSlug}&contractId=${ticketId}&tokenId=${tokenId}&userId=${dist.userId}`
        );
        return {
          recipientEmail: dist.email,
          subject: `Your ticket${dist.tokenIds.length > 0 ? "s" : ""} to ${appName}!`,
          html: await renderTicketReceiverEmail({
            eventName: appName,
            ticketUrls,
            imageUrl: appImageUrl ?? null,
            tokenIds: dist.tokenIds
          })
        };
      })
    );
    await sendBatchEmails(emailsToSend, req.nextUrl.hostname === "localhost");

    console.timeEnd("distribute");
    return NextResponse.json(
      {
        success: true,
        explorerUrls: {
          tx: getExplorerUrl(metaTxResult.data.transactionReceipt.transactionHash)
        },
        distribution,
        transactionReceipt: metaTxResult.data.transactionReceipt
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on tickets/{id}/distribute: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(postHandler)));
