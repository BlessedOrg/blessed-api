"use server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { createVaultAccessTokenItem, updateVaultItem } from "@/lib/1pwd-vault";
import { developerAccountModel, developerSessionModel, userModel, userSessionModel } from "@/models";

export interface SessionResult {
  refreshToken?: string;
  accessToken?: string;
  walletAddress?: string;
  accountId?: string;
  error?: string;
}

export async function createOrUpdateSession(email: string, accountType: AccountType, appId?: string): Promise<SessionResult> {
  try {
    if (accountType === "developer") {
      return updateDeveloperSession(email);
    } else {
      return updateUserSession(email, appId);
    }
  } catch (e) {
    return { error: e };
  }
}

export async function createSessionTokens(payload: any) {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: "2d" },
  );
  const refreshToken = uuidv4();

  // const hashedAccessToken = awaitait bcrypt.hash(accessToken, 10);
  // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  const hashedAccessToken = accessToken;
  const hashedRefreshToken = refreshToken;

  return {
    accessToken,
    refreshToken,
    hashedAccessToken,
    hashedRefreshToken,
  };
}

export const updateDeveloperSession = async (email: string) => {
  const developer = await developerAccountModel.findUnique({ where: { email } });
  if (!developer) {
    throw new Error(`Developer with email ${email} not found`);
  }

  const existingSession = await developerSessionModel.findFirst({
    where: {
      developerId: developer.id
    }
  });

  if (existingSession?.id) {
    const { accessToken, refreshToken } = await createSessionTokens({
      id: developer?.id,
      capsuleTokenVaultKey: developer.capsuleTokenVaultKey,
      accessTokenVaultKey: developer.accessTokenVaultKey,
      walletAddress: developer.walletAddress
    });
    await developerSessionModel.update({
      where: {
        id: existingSession.id
      },
      data: {
        developerId: developer.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    console.log(`Updating vault item ${developer.id}`);
    const vaultItem = await updateVaultItem(developer.accessTokenVaultKey, [
      {
        op: "replace",
        path: "/fields/accessToken/value",
        value: accessToken
      }
    ], "accessToken");
    if (!vaultItem?.id) {
      throw new Error("❌VAULT ITEM NOT UPDATED");
    } else {
      console.log("✅UPDATED VAULT ITEM VALUE");
    }
    return {
      accessToken,
      refreshToken,
      walletAddress: developer.walletAddress,
      developerId: developer.id
    };
  } else {
    const vaultItem = await createVaultAccessTokenItem("---", developer.id);
    //wait for vault to be created
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!vaultItem?.id) {
      throw new Error("❌VAULT ITEM NOT CREATED");
    } else {
      await developerAccountModel.update({
        where: { id: developer.id },
        data: {
          accessTokenVaultKey: vaultItem.id
        }
      });
      const { accessToken, refreshToken } = await createSessionTokens({
        id: developer?.id,
        accessTokenVaultKey: vaultItem.id,
        capsuleTokenVaultKey: developer.capsuleTokenVaultKey,
        walletAddress: developer.walletAddress
      });
      console.log("✅CREATED VAULT ITEM");
      await updateVaultItem(vaultItem.id, [
        {
          op: "replace",
          path: "/fields/accessToken/value",
          value: accessToken
        }
      ], "accessToken");
      return {
        accessToken,
        refreshToken,
        walletAddress: developer.walletAddress,
        developerId: developer.id
      };
    }
  }
};

export const updateUserSession = async (email: string, appId: string) => {
  const user = await userModel.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  const existingSession = await userSessionModel.findFirst({
    where: {
      userId: user.id
    }
  });

  if (existingSession?.id) {
    const { hashedRefreshToken, hashedAccessToken, accessToken, refreshToken } = await createSessionTokens({
      id: user?.id,
      capsuleTokenVaultKey: user.capsuleTokenVaultKey,
      walletAddress: user.walletAddress
    });
    const updatedSession = await userSessionModel.update({
      where: {
        id: existingSession.id
      },
      data: {
        accessToken: hashedAccessToken,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });

    if (!updatedSession) {
      return { error: "Session not updated, something went wrong ⛑️" };
    }
    return {
      accessToken,
      refreshToken,
      walletAddress: user.walletAddress,
      userId: user.id
    };
  } else {
    const { accessToken, refreshToken } = await createSessionTokens({
      id: user?.id,
      capsuleTokenVaultKey: user.capsuleTokenVaultKey,
      walletAddress: user.walletAddress
    });
    await userSessionModel.create({
      data: {
        userId: user.id,
        appId,
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      accessToken,
      refreshToken,
      walletAddress: user.walletAddress,
      userId: user.id
    };
  }
};