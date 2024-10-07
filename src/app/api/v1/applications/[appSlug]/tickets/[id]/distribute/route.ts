import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContract } from "@/lib/viem";
import { smartContractModel } from "@/models";
import { getAppIdBySlug } from "@/lib/queries";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import renderTicketReceiverEmail from "@/lib/emails/templates/TicketReceiverEmail";
import { sendBatchEmails } from "@/lib/emails/sendBatch";
import { parseEventLogs } from "viem";

const DistributeSchema = z.object({
  distributions: z.array(
    z.object({
      email: z.string().email(),
      amount: z.number().int().positive()
    })
  )
});

async function postHandler(req: NextRequestWithUserAccessToken, { params: { appSlug, id } }) {
  try {
    const validBody = DistributeSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const app = await getAppIdBySlug(appSlug);
    if (!app) {
      return NextResponse.json(
        { error: `App not found` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const smartContract = await smartContractModel.findUnique({
      where: {
        id,
        developerId: req.developerId,
        name: "tickets",
        appId: app.id
      }
    });
    if (!smartContract) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract tickets from User ${req.userId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const { users } = await createMissingAccounts(validBody.data.distributions.map(distribution => distribution.email), app.id);
    const emailToWalletMap = new Map(users.map(account => [account.email, { walletAddress: account.walletAddress, id: account.id }]));
    const distribution = validBody.data.distributions.map(distribution => {
      const mappedUser = emailToWalletMap.get(distribution.email);
      if (mappedUser) {
        return {
          userId: mappedUser.id,
          email: distribution.email,
          walletAddr: mappedUser.walletAddress,
          amount: distribution.amount,
          tokenIds: []
        }
      }
      return null;
    }).filter((item) => item !== null);


    const result = await writeContract(
      smartContract.address,
      "distribute",
      [distribution.map(dist => [dist.walletAddr, dist.amount])],
      contractArtifacts["tickets"].abi
    );

    const logs = parseEventLogs({
      abi: contractArtifacts["tickets"].abi,
      logs: result.logs,
    });

    const transferSingleEventArgs = logs
      .filter(log => (log as any) !== "TransferSingle")
      .map((log) => (log as any)?.args);

    transferSingleEventArgs.forEach((args) => {
      const matchingRecipient = distribution
        .find(d => d.walletAddr.toLowerCase() == args.to.toLowerCase())
      if (matchingRecipient) {
        matchingRecipient.tokenIds.push(args.id.toString())
      }
    })

    const emailsToSend = await Promise.all(
      distribution.map(async (dist: any) => {
        const ticketUrls = dist.tokenIds.map((tokenId) =>
          `https://blessed.fan/show-ticket?app=${app.slug}&contractId=${smartContract.id}&tokenId=${tokenId}&userId=${dist.userId}`
        );
        return {
          recipientEmail: dist.email,
          subject: `Your ticket${dist.tokenIds.length > 0 ? "s" : ""} to ${app.name}!`,
          html: await renderTicketReceiverEmail({
            eventName: app.name,
            ticketUrls,
            imageUrl: app?.imageUrl ?? null,
            tokenIds: dist.tokenIds
          })
        }
      })
    );
    await sendBatchEmails(emailsToSend, req.nextUrl.hostname === "localhost");

    return NextResponse.json(
      {
        success: true,
        distributionBlockHash: result.blockHash,
        distribution,
        explorerUrls: {
          distributionTx: getExplorerUrl(result.transactionHash)
        }
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
export const POST = withDeveloperAccessToken(postHandler);
