import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContract } from "@/lib/viem";
import z from "zod";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";

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

    const result = await writeContract(
      ticketContractAddress,
      "updateSupply",
      [validBody.data.additionalSupply],
      contractArtifacts["tickets"].abi
    );

    return NextResponse.json(
      {
        success: true,
        updateSupplyBlockHash: result.blockHash,
        explorerUrls: {
          updateSupplyTx: getExplorerUrl(result.transactionHash)
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
