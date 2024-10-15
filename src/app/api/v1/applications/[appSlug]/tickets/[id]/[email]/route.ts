import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { smartContractModel, userModel } from "@/models";
import { getAppIdBySlug } from "@/lib/queries";
import z from "zod";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { isEmpty } from "lodash-es";

const EmailOwnerSchema = z.object({
  email: z.string().email()
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug, id, email } }) {
  try {
    const validParam = EmailOwnerSchema.safeParse({ email });
    if (!validParam.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validParam.error}` },
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
        { error: `Wrong parameters. Smart contract tickets from Developer ${req.developerId} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const user = await userModel.findUnique({
      where: {
        email
      }
    });

    const result = await readContract(
      smartContract.address,
      contractArtifacts["tickets"].abi,
      "getTokensByUser",
      [user.walletAddress]
    );

    return NextResponse.json(
      {
        user: {
          hasTicket: !isEmpty(result),
          ...!isEmpty(result) && {
            ownedIds: [result].map(id => id.toString())
          },
          email: user.email,
          walletAddress: user.walletAddress
        }
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 error on tickets/{id}/distribute: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const GET = withApiKeyOrDevAccessToken(postHandler);
