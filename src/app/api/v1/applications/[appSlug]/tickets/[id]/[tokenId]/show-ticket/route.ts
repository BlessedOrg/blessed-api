import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { smartContractModel, userModel } from "@/models";
import { getAppIdBySlug } from "@/lib/queries";

async function getHandler(req: NextRequestWithUserAccessToken, { params: { appSlug, id, tokenId } }) {
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
        { error: `Wrong parameters. Smart contract tickets from User ${req.userId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const userEmail = req.nextUrl.searchParams.get('userEmail');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'userId is required in query parameters' },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const user = await userModel.findUnique({
      where: {
        email: userEmail
      }
    })
    if (!user) {
      return NextResponse.json(
        { error: `User with email "${userEmail}" not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await readContract(
      smartContract.address,
      contractArtifacts["tickets"].abi,
      "balanceOf",
      [user.walletAddress, tokenId]
    );

    return NextResponse.json(
      {
        eventName: app.name,
        ticketId: tokenId,
        userWalletAddress: user.walletAddress,
        userEmail,
        success: true,
        result: Number(result),
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
export const GET = (getHandler);
