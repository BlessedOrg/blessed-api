import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import z from "zod";
import { deployContract, getExplorerUrl } from "@/lib/viem";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { uploadMetadata } from "@/lib/irys";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { getSmartWalletForCapsuleWallet } from "@/lib/capsule";

const EntranceSchema = z.object({
  ticketAddress: z.string().min(1, "Ticket address is required")
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
  const { appId, appOwnerWalletAddress } = req;
  try {
    const validBody = EntranceSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const metadataPayload = {
      name: "Entrance checker",
      symbol: "",
      description: "Entrance checker for event",
      image: ""
    };
    const { metadataUrl, metadataImageUrl } = await uploadMetadata(metadataPayload);
    const contractName = "entrance";

    const smartWallet = await getSmartWalletForCapsuleWallet(req.capsuleTokenVaultKey);
    const ownerSmartWallet = await smartWallet.getAccountAddress();

    const args = {
      owner: appOwnerWalletAddress,
      ownerSmartWallet,
      ticketAddress: validBody.data.ticketAddress,
    };

    const contract = await deployContract(contractName, Object.values(args));
    console.log("⛓️ Contract Explorer URL: ", getExplorerUrl(contract.contractAddr));

    const maxId = await smartContractModel.aggregate({
      where: {
        appId,
        developerId: req.developerId,
        name: contractName
      },
      _max: {
        version: true
      }
    });

    const nextId = (maxId._max.version || 0) + 1;

    const smartContractRecord = await smartContractModel.create({
      data: {
        address: contract.contractAddr,
        name: contractName,
        developerId: req.developerId,
        version: nextId,
        appId,
        metadataUrl,
        metadataPayload: {
          ...metadataPayload,
          ...metadataImageUrl && { metadataImageUrl }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        contract,
        smartContractRecord,
        explorerUrls: {
          contract: getExplorerUrl(contract.contractAddr)
        }
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on entrance/deploy: ", error.message);
    return NextResponse.json(
      { error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = withApiKeyOrDevAccessToken(withAppValidate(postHandler));
