import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getExplorerUrl } from "@/lib/viem";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";
import { metaTx } from "@/lib/gelato";
import { PrefixedHexString } from "ethereumjs-util";

const WhitelistSchema = z.object({
  addEmails: z.array(z.string().email()).min(1),
  removeEmails: z.array(z.string().email()).optional()
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate & NextRequestWithTicketValidate) {
  const { appId, ticketContractAddress } = req;
  try {
    const validBody = WhitelistSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    const allEmails = [...validBody.data.addEmails, ...(validBody.data.removeEmails || [])];
    const { users } = await createMissingAccounts(allEmails, appId);
    const emailToWalletMap = new Map(users.map(account => [account.email, account.walletAddress]));

    const whitelistUpdates = [
      ...validBody.data.addEmails.map(email => {
        const walletAddress = emailToWalletMap.get(email);
        return walletAddress ? [walletAddress, true] : null;
      }),
      ...(validBody.data.removeEmails || []).map(email => {
        const walletAddress = emailToWalletMap.get(email);
        return walletAddress ? [walletAddress, false] : null;
      })
    ].filter((item): item is [string, boolean] => item !== null);

    const metaTxResult = await metaTx({
      contractAddress: ticketContractAddress as PrefixedHexString,
      contractName: "tickets",
      functionName: "updateWhitelist",
      args: [whitelistUpdates],
      capsuleTokenVaultKey: req.capsuleTokenVaultKey,
      userWalletAddress: req.appOwnerWalletAddress
    });

    if (metaTxResult.error) {
      return NextResponse.json(
        { success: false, error: metaTxResult.error },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      {
        success: true,
        transactionReceipt: {
          ...metaTxResult.data.metaTransactionStatus,
          blockNumber: metaTxResult.data.transactionReceipt.blockNumber.toString(),
        },
        explorerUrls: {
          updateWhitelistTx: getExplorerUrl(metaTxResult.data.transactionReceipt.transactionHash)
        },
        whitelistUpdatesMap: whitelistUpdates
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on tickets/{id}/supply: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(postHandler)));
