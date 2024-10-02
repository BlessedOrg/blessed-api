import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { client, contractArtifacts, deployContract, getExplorerUrl, writeContractWithNonceGuard } from "@/viem";
import { smartContractModel } from "@/prisma/models";
import z from "zod";
import { uploadMetadata } from "@/server/services/irys";

// const deployTicket = async () => {
//   const params = {
//     owner: client.account.address,
//     baseURI: "https://api.example.com/metadata/",
//     name: "Free Ticket",
//     symbol: "FTK",
//     initialSupply: 100,
//     maxSupply: 10000,
//     transferable: true,
//     whitelistOnly: false
//   };
//
//   const args = Object.values(params);
//   return deployContract("tickets", args);
// };

const TicketSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string(),
  initialSupply: z.number().int().positive(),
  maxSupply: z.number().int().positive(),
  transferable: z.boolean(),
  whitelistOnly: z.boolean()
});

type TicketSchema = z.infer<typeof TicketSchema>

async function postHandler(req: NextRequestWithDeveloperUserAccessToken & NextRequestWithApiToken) {
  try {
    const body = await req.json();
    const validatedData: TicketSchema = TicketSchema.parse(body);

    const { metadataUrl } = await uploadMetadata({
      name: validatedData.name,
      symbol: validatedData.symbol,
      description: validatedData.description,
      image: "",
    });

    const args = {
      // 🏗️ TODO: replace with developer's client
      owner: client.account.address,
      baseURI: metadataUrl,
      name: validatedData.name,
      symbol: validatedData.symbol,
      initialSupply: validatedData.initialSupply,
      maxSupply: validatedData.maxSupply,
      transferable: validatedData.transferable,
      whitelistOnly: validatedData.whitelistOnly,
    }

    const contract = await deployContract("tickets", Object.values(args))
    console.log("⛓️ Contract Explorer URL: ", getExplorerUrl(contract.contractAddr));

    return NextResponse.json(
      {
        success: true,
        contract,
        explorerUrls: {
          contract: getExplorerUrl(contract.contractAddr),
        }
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🔮 error: ", error.message);
    return NextResponse.json(
      { error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = postHandler;

