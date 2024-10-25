import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import z from "zod";
import { uploadMetadata } from "@/lib/irys";
import { deployContract, getExplorerUrl } from "@/lib/viem";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { getSmartWalletForCapsuleWallet } from "@/lib/capsule";

const TicketSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol must be 10 characters or less"),
  initialSupply: z.number().int().positive("Initial supply must be a positive integer"),
  maxSupply: z.number().int().positive("Max supply must be a positive integer"),
  transferable: z.boolean(),
  whitelistOnly: z.boolean()
}).refine(data => data.initialSupply <= data.maxSupply, {
  message: "Initial supply must be less than or equal to max supply",
  path: ["initialSupply"]
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
  const { appId, appOwnerWalletAddress, developerId } = req;
  try {
    const validBody = TicketSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    const { metadataUrl, metadataImageUrl } = await uploadMetadata({
      name: validBody.data.name,
      symbol: validBody.data.symbol,
      description: validBody.data.description,
      image: ""
    });

    const smartWallet = await getSmartWalletForCapsuleWallet(req.capsuleTokenVaultKey);
    const ownerSmartWallet = await smartWallet.getAccountAddress();

    const contractName = "tickets";
    const args = {
      // owner: account.address,
      owner: appOwnerWalletAddress,
      ownerSmartWallet,
      baseURI: metadataUrl,
      name: validBody.data.name,
      symbol: validBody.data.symbol,
      initialSupply: validBody.data.initialSupply,
      maxSupply: validBody.data.maxSupply,
      transferable: validBody.data.transferable,
      whitelistOnly: validBody.data.whitelistOnly
    };

    const contract = await deployContract(contractName, Object.values(args));
    console.log("⛓️ Contract Explorer URL: ", getExplorerUrl(contract.contractAddr));

    // const result = await writeContract(
    //   contract.contractAddr as PrefixedHexString,
    //   "updateSupply",
    //   ["10"],
    //   contractArtifacts["tickets"].abi
    // );

    const maxId = await smartContractModel.aggregate({
      where: {
        appId,
        developerId,
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
        developerId,
        version: nextId,
        metadataUrl,
        metadataPayload: {
          name: validBody.data.name,
          symbol: validBody.data.symbol,
          description: validBody.data.description,
          ...metadataImageUrl && { metadataImageUrl }
        },
        appId
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
    console.log("🚨 error on tickets/deploy: ", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = withApiKeyOrDevAccessToken(withAppValidate(postHandler));
