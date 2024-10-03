"use server";
import { createSessionTokens } from "@/lib/auth/createSessionTokens";
import { developerAccountModel, developersUserAccountModel, sessionModel } from "@/models";
import { sessionType } from "@prisma/client";
import { createVaultApiTokenItem, updateVaultItem } from "@/lib/1pwd-vault";

export async function createOrUpdateSession(email: string, accountType: sessionType) {
  const existingUser: any =
    accountType === "dev"
      ? await developerAccountModel.findUnique({ where: { email } })
      : await developersUserAccountModel.findUnique({ where: { email } });

  if (!existingUser) {
    throw new Error(`User with email ${email} not found`);
  }

  const connectUser =
    accountType === "dev"
      ? {
        DeveloperAccount: {
          connect: {
            id: existingUser.id
          }
        }
      }
      : {
        DevelopersUserAccount: {
          connect: {
            id: existingUser.id
          }
        }
      };

  const existingSessionFilters: any =
    accountType === "dev"
      ? {
        developerId: existingUser.id
      }
      : {
        developerUserId: existingUser.id
      };

  const existingSession = await sessionModel.findFirst({
    where: {
      ...existingSessionFilters
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existingSession) {
    const { hashedRefreshToken, hashedAccessToken, accessToken, refreshToken } = await createSessionTokens({
      id: existingUser?.id,
      ...(accountType === "dev" ? { vaultKey: existingUser.vaultKey } : {})
    });
    const updatedSession = await sessionModel.update({
      where: {
        id: existingSession.id
      },
      data: {
        accessToken: hashedAccessToken,
        refreshToken: hashedRefreshToken,
        ...connectUser,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });
    if (accountType === "dev") {
      console.log(`Updating vault item ${existingUser.vaultKey}`);
      const vaultItem = await updateVaultItem(existingUser.vaultKey, [
        {
          op: "replace",
          path: "/fields/accessToken/value",
          value: accessToken
        }
      ], "apiKey");
      if (!vaultItem?.id) {
        console.log("❌VAULT ITEM VALUE NOT UPDATED");
      } else {
        console.log("✅UPDATED VAULT ITEM VALUE");
      }
    }
    if (!updatedSession) {
      return { error: "Session not updated, something went wrong ⛑️" };
    }
    return {
      accessToken,
      refreshToken,
      walletAddress: existingUser.walletAddress
    };
  }
  const sessionTokens = {
    accessToken: "",
    refreshToken: "",
  }
  if (accountType === "dev") {
    const vaultItem = await createVaultApiTokenItem("---", existingUser.id);
    //wait for vault to be created
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!vaultItem?.id) {
      console.log("❌VAULT ITEM NOT CREATED");
    } else {
      await developerAccountModel.update({
        where: { id: existingUser.id },
        data: {
          vaultKey: vaultItem.id
        }
      });
      const { accessToken, refreshToken } = await createSessionTokens({
        id: existingUser?.id,
        vaultKey: vaultItem.id
      });
      sessionTokens.accessToken = accessToken;
      sessionTokens.refreshToken = refreshToken;
      console.log("✅CREATED VAULT ITEM");
      await updateVaultItem(vaultItem.id, [
        {
          op: "replace",
          path: "/fields/accessToken/value",
          value: accessToken
        }
      ], "apiKey");
    }
  } else {
    const { accessToken, refreshToken } = await createSessionTokens({
      id: existingUser?.id,
    });
    sessionTokens.accessToken = accessToken;
    sessionTokens.refreshToken = refreshToken;
  }

  const newSession = await sessionModel.create({
    data: {
      ...sessionTokens,
      ...connectUser,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      sessionType: sessionType[accountType],
      DeveloperAccount: {
        connect: {
          id: accountType === "dev" ? existingUser.id : existingUser.developerId
        }
      }
    }
  });

  console.log(`New session id: ${newSession.id}`);

  return {
    ...sessionTokens,
    walletAddress: existingUser.walletAddress
  };
}
