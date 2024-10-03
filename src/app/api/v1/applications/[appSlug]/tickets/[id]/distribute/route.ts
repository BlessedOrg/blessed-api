import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContract } from "@/lib/viem";
import { smartContractModel } from "@/models";
import { getAppIdBySlug } from "@/lib/app";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts/createMissingAccounts";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import renderTicketReceiverEmail from "@/lib/emails/templates/TicketReceiverEmail";
import { sendBatchEmails } from "@/lib/emails/sendBatch";

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
    const emailToWalletMap = new Map(users.map(account => [account.email, account.walletAddress]));
    const distributionMap = validBody.data.distributions.map(distribution => {
      const walletAddress = emailToWalletMap.get(distribution.email);
      if (walletAddress) {
        return [walletAddress, distribution.amount] as [string, number];
      }
      return null;
    }).filter((item): item is [string, number] => item !== null);

    const result = await writeContract(
      smartContract.address,
      "distribute",
      [distributionMap],
      contractArtifacts["tickets"].abi
    );

    const emailsToSend = await Promise.all(
      validBody.data.distributions.map(async (receiver: any) => ({
        recipientEmail: receiver.email,
        subject: `Your ticket to ${app.name}!`,
        html: await renderTicketReceiverEmail({
          eventName: app.name,
          // 🏗️ TODO: remove this `is any` once the schema id updated
          ticketUrl: (smartContract as any)?.metadataImgUrl ?? app?.imageUrl ?? null,
          imageUrl: app?.imageUrl ?? null
        })
      }))
    );
    await sendBatchEmails(emailsToSend, req.nextUrl.hostname === "localhost");

    return NextResponse.json(
      {
        success: true,
        distributionBlockHash: result.blockHash,
        distributionMap,
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
