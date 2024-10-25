import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getExplorerUrl } from "@/lib/viem";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";
import { PrefixedHexString } from "ethereumjs-util";
import { biconomyMetaTx } from "@/lib/biconomy";

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

    console.log("🔮 users: ", users)
    const emailToWalletMap = new Map(users.map(account => [account.email, account.smartWalletAddress]));

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
    
    console.log("🔥 whitelistUpdates: ", whitelistUpdates)

    const metaTxResult = await biconomyMetaTx({
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
        explorerUrls: {
          tx: getExplorerUrl(metaTxResult.data.transactionReceipt.transactionHash)
        },
        whitelistUpdatesMap: whitelistUpdates,
        transactionReceipt: metaTxResult.data.transactionReceipt
      },
      { status: StatusCodes.OK }
    );
  } catch (e) {
    console.log("🚨 error on tickets/{id}/whitelist: ", e.message);
    console.error("🚨 error keys:", Object.keys(e));
    return NextResponse.json(
      { success: false, error: e?.reason ||e?.cause || e?.shortMessage || e?.message || e },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(postHandler)));
