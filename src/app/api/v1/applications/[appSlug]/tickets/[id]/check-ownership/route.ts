import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { smartContractModel } from "@/models";
import { getAppIdBySlug } from "@/lib/queries";
import z from "zod";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { isEmpty } from "lodash-es";

const CheckOwnershipSchema = z.object({
  emails: z.array(z.string().email())
});

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug, id } }) {
  try {
    const validBody = CheckOwnershipSchema.safeParse(await req.json());
    if (!validBody.success) {
      return NextResponse.json(
        { error: `Validation failed: ${validBody.error}` },
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

    const { users } = await createMissingAccounts(validBody.data.emails.map(email => email), app.id);

    const owners = [];

    for (const user of users) {
      const result = await readContract(
        smartContract.address,
        contractArtifacts["tickets"].abi,
        "getTokensByUser",
        [user.walletAddress]
      );

      owners.push({
        hasTicket: !isEmpty(result),
        ...!isEmpty(result) && {
          ownedIds: [result].map(id => id.toString())
        },
        email: user.email,
        walletAddress: user.walletAddress
      });
    }

    return NextResponse.json(
      { success: true, emails: owners },
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
export const POST = withApiKeyOrDevAccessToken(postHandler);
