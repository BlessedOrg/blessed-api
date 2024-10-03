import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, getExplorerUrl, writeContract } from "@/lib/viem";
import { smartContractModel } from "@/models";
import { getAppIdBySlug } from "@/lib/app";
import z from "zod";

const DistributeSchema = z.object({
  additionalSupply: z.number().int().positive()
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

    const result = await writeContract(
      smartContract.address,
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
// TODO: 🏗️ restrict this endpoint!
export const POST = postHandler;

