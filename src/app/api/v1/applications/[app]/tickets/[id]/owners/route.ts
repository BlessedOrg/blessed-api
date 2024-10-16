import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { userModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithTicketValidate & NextRequestWithAppValidate) {
  const { ticketContractAddress } = req;
  try {
    const pageSize = 100; // Number of addresses to fetch per call
    let allHolders = [];
    let start = 0;

    while (true) {
      try {
        const holders: any = await readContract(
          ticketContractAddress,
          contractArtifacts["tickets"].abi,
          "getTicketHolders",
          [start, pageSize]
        );
        allHolders = allHolders.concat(holders);
        start += holders.length;

        if (holders.length < pageSize) {
          break;
        }
      } catch (error) {
        console.error("Error fetching ticket holders:", error);
        break;
      }
    }
    const owners = await userModel.findMany({
      where: {
        walletAddress: {
          in: allHolders
        }
      },
      select: {
        email: true,
        walletAddress: true
      }
    });

    return NextResponse.json(
      { owners },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on tickets/{id}/owners: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const GET = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(getHandler)));
