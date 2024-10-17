import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getExplorerUrl } from "@/lib/viem";
import z from "zod";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";
import { metaTx } from "@/lib/gelato";
import { PrefixedHexString } from "ethereumjs-util";

const DistributeSchema = z.object({
  additionalSupply: z.number().int().positive()
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate & NextRequestWithTicketValidate) {
  const { ticketContractAddress } = req;
  try {
    const validBody = DistributeSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const metaTxResult = await metaTx({
      contractAddress: ticketContractAddress as PrefixedHexString,
      contractName: "tickets",
      functionName: "updateSupply",
      args: [validBody.data.additionalSupply],
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
          updateSupplyTx: getExplorerUrl(metaTxResult.data.transactionReceipt.transactionHash)
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
export const POST = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(postHandler)));
