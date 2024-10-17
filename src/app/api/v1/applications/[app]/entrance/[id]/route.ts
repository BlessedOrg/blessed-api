import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKeyAndUserAccessToken } from "@/app/middleware/withApiKeyAndUserAccessToken";
import z from "zod";
import { smartContractModel } from "@/models";
import { contractArtifacts, getExplorerUrl, readContract } from "@/lib/viem";
import { metaTx } from "@/lib/gelato";
import { PrefixedHexString } from "ethereumjs-util";

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
    const isAlreadyEntered = await readContract(
      contractAddress,
      contractArtifacts["entrance"].abi,
      "hasEntry",
      [req.walletAddress]
    );
    if (!isAlreadyEntered) {
      const { data: metaTxResult, error, status } = await metaTx({
        contractAddress: contractAddress,
        contractName: "entrance",
        functionName: "entry",
        args: [validBody.data.ticketId],
        userWalletAddress: req.walletAddress as PrefixedHexString,
        capsuleTokenVaultKey: req.capsuleTokenVaultKey,
      });

      if (error) {
        return NextResponse.json(
          { success: false, error },
          { status: StatusCodes.BAD_REQUEST }
        );
      }

      return NextResponse.json(
        {
          success: true,
          transactionReceipt: {
            ...metaTxResult.metaTransactionStatus,
            blockNumber: metaTxResult.transactionReceipt.blockNumber.toString(),
          },
          explorerUrls: {
            distributionTx: getExplorerUrl(metaTxResult.transactionReceipt.transactionHash)
          }
        },
        { status }
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

