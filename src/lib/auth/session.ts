"use server";

import { updateDeveloperSession } from "@/lib/auth/sessions/updateDeveloperSession";
import { updateUserSession } from "@/lib/auth/sessions/updateUserSession";

export async function createOrUpdateSession(email: string, accountType: AccountType, appId?: string): Promise<{ refreshToken?: string, accessToken?: string, walletAddress?: string, accountId?: string, error?: string }> {
  try {
    if (accountType === "developer") {
      const developerSession = await updateDeveloperSession(email);
      return developerSession;
    } else {
      const userSession = await updateUserSession(email, appId);
      return userSession;
    }
  } catch (e) {
    return { error: e };
  }
}
