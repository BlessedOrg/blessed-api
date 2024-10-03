import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import z from "zod";
import { uploadMetadata } from "@/lib/irys";
import { getAppIdBySlug } from "@/lib/app";
import { account, deployContract, getExplorerUrl } from "@/lib/viem";

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

async function postHandler(req: NextRequestWithUserAccessToken, { params: { appSlug } }) {
  try {
    const app = await getAppIdBySlug(appSlug);
    if (!app) {
      return NextResponse.json(
        { error: `App not found` },
        { status: StatusCodes.NOT_FOUND }
      );
    }
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

    const contractName = "tickets";
    const args = {
      // 🏗️ TODO: replace with developer's client
      owner: account.address,
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

    const maxId = await smartContractModel.aggregate({
      where: {
        appId: app.id,
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
        metadataImgUrl: metadataUrl,
        metadataPayload: {
          name: validBody.data.name,
          symbol: validBody.data.symbol,
          description: validBody.data.description,
          ...metadataImageUrl && { metadataImageUrl }
        },
        appId: app.id
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
      { error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
// TODO: 🏗️ restrict this endpoint!
export const POST = postHandler;

