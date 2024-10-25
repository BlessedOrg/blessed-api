import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { appModel, smartContractModel, userModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithTicketValidate & NextRequestWithAppValidate) {
  const { ticketContractAddress, appId, ticketId } = req;
  try {
    const app = await appModel.findUnique({
      where: {
        id: appId
      }
    });
    
    const sc = await smartContractModel.findUnique({
      where: {
        id: ticketId
      }
    });
    
      const readTicketContract = (functionName: string, args: [] | null = null) => {
      return readContract(
        ticketContractAddress,
        contractArtifacts["tickets"].abi,
        functionName,
        args
      )
    };

    const name = await readTicketContract("name");
    const currentSupply = await readTicketContract("currentSupply");
    const totalSupply = await readTicketContract("totalSupply");
    const initialSupply = await readTicketContract("initialSupply");
    const transferable = await readTicketContract("transferable");
    const whitelistOnly = await readTicketContract("whitelistOnly");
    const nextTokenId = await readTicketContract("nextTokenId");

    return NextResponse.json(
      {
        applicationName: app.name,
        applicationDescription: app.description,
        ticketName: name,
        ticketDescription: (sc as any)?.metadataPayload?.description,
        ticketImage: (sc as any)?.metadataPayload?.metadataImageUrl,
        initialSupply: Number(initialSupply),
        currentSupply: Number(currentSupply),
        totalSupply: Number(totalSupply),
        tokensSold: Number(nextTokenId),
        transferable,
        whitelistOnly,
        createdAt: new Date(sc.createdAt),
        price: 0,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on tickets/{id}/details: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const GET = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(getHandler)));
