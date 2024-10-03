import { createOrUpdateSession } from "@/lib/auth/session";
import { StatusCodes } from "http-status-codes";

export const refreshAccountSession = async (email: string, accountType: AccountType) => {
  try {
    const newSessionData = await createOrUpdateSession(email, accountType);
    const data = {
      accessToken: newSessionData.accessToken,
      refreshToken: newSessionData.refreshToken,
      developer: {
        walletAddress: newSessionData.walletAddress,
        id: newSessionData.accountId
      },
      message: "Logged in successfully"
    };
    return {
      data,
      status: StatusCodes.OK
    };
  } catch (e) {
    return {
      error: e,
      status: StatusCodes.INTERNAL_SERVER_ERROR
    };
  }
};