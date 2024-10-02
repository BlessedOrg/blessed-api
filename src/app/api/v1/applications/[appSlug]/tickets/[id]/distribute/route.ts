import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContractWithNonceGuard } from "@/lib/viem";
import { smartContractModel } from "@/models";
import { getAppIdBySlug } from "@/lib/app";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts/createMissingAccounts";

const DistributeSchema = z.object({
  distributions: z.array(
    z.object({
      email: z.string().email(),
      amount: z.number().int().positive()
    })
  )
});

async function postHandler(req: NextRequestWithDeveloperUserAccessToken & NextRequestWithApiToken, { params: { appSlug, id } }) {
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

    const { newAccounts, existingAccounts } = await createMissingAccounts(validBody.data.distributions.map(distribution => distribution.email));
    const accounts = [...newAccounts, ...existingAccounts];
    const emailToWalletMap = new Map(accounts.map(account => [account.email, account.walletAddress]));
    const distributionMap = validBody.data.distributions.map(distribution => {
      const walletAddress = emailToWalletMap.get(distribution.email);
      if (walletAddress) {
        return [walletAddress, distribution.amount] as [string, number];
      }
      return null;
    })
      .filter((item): item is [string, number] => item !== null);

    const result = await writeContractWithNonceGuard(
      smartContract.address,
      "distribute",
      [distributionMap],
      contractArtifacts["tickets"].abi,
      req.userId
    );

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
  } catch(error) {
    console.log("🚨 error on tickets/{id}/distribute: ", error.message)
    return NextResponse.json(
      { error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = postHandler;

