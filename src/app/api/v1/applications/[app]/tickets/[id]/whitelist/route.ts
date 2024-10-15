import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContract } from "@/lib/viem";
import { smartContractModel } from "@/models";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";

const WhitelistSchema = z.object({
  addEmails: z.array(z.string().email()).min(1),
  removeEmails: z.array(z.string().email()).optional()
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate, { params: { id } }) {
  const { appId } = req;
  try {
    const validBody = WhitelistSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const smartContract = await smartContractModel.findUnique({
      where: {
        id,
        developerId: req.developerId,
        name: "tickets",
        appId
      }
    });
    if (!smartContract) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract tickets from Developer ${req.developerId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
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

    const result = await writeContract(
      smartContract.address,
      "updateWhitelist",
      [whitelistUpdates],
      contractArtifacts["tickets"].abi
    );

    return NextResponse.json(
      {
        success: true,
        whitelistUpdatesMap: whitelistUpdates,
        updateWhitelistBlockHash: result.blockHash,
        explorerUrls: {
          updateWhitelistTx: getExplorerUrl(result.transactionHash)
        }
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
export const POST = withApiKeyOrDevAccessToken(withAppValidate(postHandler));
