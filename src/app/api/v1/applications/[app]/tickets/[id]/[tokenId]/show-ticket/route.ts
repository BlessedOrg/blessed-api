import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { userModel } from "@/models";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";

async function getHandler(req: NextRequestWithUserAccessToken & NextRequestWithAppValidate & NextRequestWithTicketValidate, { params: { tokenId } }) {
  const { appName, ticketContractAddress } = req;
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required in query parameters" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const user = await userModel.findUnique({
      where: {
        id: userId
      },
      select: {
        email: true,
        walletAddress: true
      }
    });
    if (!user) {
      return NextResponse.json(
        { error: `User with ID "${userId}" not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await readContract(
      ticketContractAddress,
      contractArtifacts["tickets"].abi,
      "balanceOf",
      [user.walletAddress, tokenId]
    );

    return NextResponse.json(
      {
        eventName: appName,
        ticketId: tokenId,
        userWalletAddress: user.walletAddress,
        userEmail: user.email,
        success: true,
        result: Number(result)
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
export const GET = (withAppValidate(withTicketValidate(getHandler)));
