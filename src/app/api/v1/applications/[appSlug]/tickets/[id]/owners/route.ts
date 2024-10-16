import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { smartContractModel, userModel } from "@/models";
import { getAppIdBySlug } from "@/lib/queries";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug, id } }) {
  try {
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
        { error: `Wrong parameters. Smart contract tickets from Developer ${req.developerId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const pageSize = 100; // Number of addresses to fetch per call
    let allHolders = [];
    let start = 0;

    while (true) {
      try {
        const holders: any = await readContract(
          smartContract.address,
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
export const GET = withApiKeyOrDevAccessToken(getHandler);
