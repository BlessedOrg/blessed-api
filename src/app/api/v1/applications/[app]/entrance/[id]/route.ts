import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKeyAndUserAccessToken } from "@/app/middleware/withApiKeyAndUserAccessToken";
import z from "zod";
import { smartContractModel } from "@/models";
import { contractArtifacts, getExplorerUrl, readContract } from "@/lib/viem";
import { PrefixedHexString } from "ethereumjs-util";
import { biconomyMetaTx } from "@/lib/biconomy";
import { getSmartWalletForCapsuleWallet } from "@/lib/capsule";

const EntrySchema = z.object({
  ticketId: z.number().int().positive()
});

async function postRequest(req: NextRequestWithApiKeyAndUserAccessToken, { params: { id } }) {
  const validBody = EntrySchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  try {
    const entranceRecord = await smartContractModel.findUnique({ where: { id } });
    if (!entranceRecord.address) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract entrance from app ${req.appSlug} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const contractAddress = entranceRecord.address as PrefixedHexString;
    const smartWallet = await getSmartWalletForCapsuleWallet(req.capsuleTokenVaultKey);
    const ownerSmartWallet = await smartWallet.getAccountAddress();
    const isAlreadyEntered = await readContract(
      contractAddress,
      contractArtifacts["entrance"].abi,
      "hasEntry",
      [ownerSmartWallet]
    );

    // 🏗️ TODO: remove
    console.log("🔮 ownerSmartWallet: ", ownerSmartWallet)
    console.log("🔮 req.walletAddress: ", req.walletAddress)
    console.log("🔮 isAlreadyEntered: ", isAlreadyEntered)
    if (!isAlreadyEntered) {
      const metaTxResult = await biconomyMetaTx({
        contractAddress: contractAddress,
        contractName: "entrance",
        functionName: "entry",
        args: [validBody.data.ticketId],
        userWalletAddress: req.walletAddress as PrefixedHexString,
        capsuleTokenVaultKey: req.capsuleTokenVaultKey,
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
          transactionReceipt: metaTxResult.data.transactionReceipt
        },
        { status: metaTxResult.status }
      );
    } else {
      return NextResponse.json(
        { message: "Already entered" },
        { status: StatusCodes.OK }
      );
    }
  } catch (e) {
    console.error("Error keys:", Object.keys(e));
    console.log("Cause keys:", Object.keys(e?.cause));
    return NextResponse.json({ error: e?.cause?.reason || e?.shortMessage || e?.message || e }, { status: StatusCodes.BAD_REQUEST });
  }
}

export const POST = withApiKeyAndUserAccessToken(postRequest);

