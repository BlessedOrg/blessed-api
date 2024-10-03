import { createSessionTokens } from "@/lib/auth/createSessionTokens";
import { createVaultAccessTokenItem, updateVaultItem } from "@/lib/1pwd-vault";
import { developerAccountModel, developerSessionModel } from "@/models";

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
      console.log("❌VAULT ITEM VALUE NOT UPDATED");
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
      console.log("❌VAULT ITEM NOT CREATED");
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