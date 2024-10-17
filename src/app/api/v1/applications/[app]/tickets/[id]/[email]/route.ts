import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { contractArtifacts, readContract } from "@/lib/viem";
import { userModel } from "@/models";
import z from "zod";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { isEmpty } from "lodash-es";
import { withAppValidate } from "@/app/middleware/withAppValidate";
import { withTicketValidate } from "@/app/middleware/withTicketValidate";

const EmailOwnerSchema = z.object({
  email: z.string().email()
});

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithTicketValidate & NextRequestWithAppValidate, { params: { email } }) {
  const { ticketContractAddress } = req;
  try {
    const validParam = EmailOwnerSchema.safeParse({ email });
    if (!validParam.success) {
      return NextResponse.json(
        { error: "Validation failed", reason: validParam.error.issues },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const user = await userModel.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await readContract(
      ticketContractAddress,
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
    console.log("🚨 error on tickets/{id}/[email]: ", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const GET = withApiKeyOrDevAccessToken(withAppValidate(withTicketValidate(getHandler)));
