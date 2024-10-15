"use server";

import { PrivyClient } from "@privy-io/server-auth";
import { StatusCodes } from "http-status-codes";
import { formatEmailToAvoidCapsuleConflict } from "@/utils/formatEmailToAvoidCapsuleConflict";

const privyAppSecret = process.env.PRIVY_APP_SECRET as string;
const privyAppId = process.env.PRIVY_APP_ID as string;

export const createPrivyAccount = async (email: string, accountId: string) => {
  const privy = new PrivyClient(privyAppId, privyAppSecret);
  const formattedEmail = formatEmailToAvoidCapsuleConflict(email, accountId);
  try {
    const privyUser = (await privy.importUser({
      linkedAccounts: [
        {
          type: "email",
          address: formattedEmail,
        },
      ],
      createEthereumWallet: true,
    })) as any;
    if (privyUser?.id) return { data: privyUser, status: StatusCodes.CREATED };
    console.log(privyUser);
    return {
      error: "Error occured while importing user to privy",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  } catch (e) {
    console.log("Error occured while importing user to privy:", e);
    return { error: e?.message, status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};
