"use server";
import { shortenWalletAddress } from "@/utils/shortenWalletAddress";

const vaultApiUrl = process.env.OP_VAULT_SERVER_HOST!;
const vaultToken = process.env.OP_API_TOKEN!;

export async function createVaultPrivateKeyItem(
  value: string,
  publicKey: string,
  address: string,
  email: string,
  deployed: boolean,
) {
  const vaultId = process.env.OP_PRIVATE_KEY_VAULT_ID!;
  try {
    const createdItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vaultToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vault: {
            id: vaultId,
          },
          title: `Credentials for: ${shortenWalletAddress(address)}`,
          category: "LOGIN",
          tags: ["sepolia", deployed ? "deployed" : "undeployed"],
          fields: [
            {
              id: "email",
              type: "STRING",
              label: "Email",
              value: email,
            },
            {
              id: "walletAddress",
              type: "STRING",
              label: "Wallet address",
              value: address,
            },
            {
              id: "publicKey",
              type: "STRING",
              label: "Public key",
              value: publicKey,
            },
            {
              id: "privateKey",
              type: "CONCEALED",
              label: "Private key",
              value,
            },
          ],
        }),
      },
    );
    console.log(`🔑 Created Key Pair in Vault for: ${email}`);
    return await createdItem.json();
  } catch (error: any) {
    console.log(
      `⛑️🔑 Failed to create Key Pair in Vault for: ${email} \n ${error?.message}`,
    );
  }
}

export async function createVaultApiTokenItem(apiToken: string, userId: string) {
  const vaultId = process.env.OP_API_TOKEN_VAULT_ID!;
  try {
    const createdItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vaultToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vault: {
            id: vaultId,
          },
          // 🚨 TODO: use title with real user's wallet/id
          title: `API Token for user ${userId}`,
          category: "API_CREDENTIAL",
          tags: ["apiToken"],
          fields: [
            {
              id: "userId",
              type: "STRING",
              label: "User ID",
              value: userId,
            },
            {
              id: "apiToken",
              label: "API Token",
              type: "CONCEALED",
              value: apiToken,
              // generate: true,
              // recipe: {
              //   length: 64,
              //   characterSets: ["LETTERS", "DIGITS"],
              // },
            },
          ],
        }),
      },
    );
    console.log(`🔑 Created API Token in Vault for User: ${userId}`);
    return await createdItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to create API Token in Vault for User: ${userId} \n ${error?.message}`);
  }
}

export async function getVaultItem(id: string, type?: "apiKey" | "privateKey") {
  const vaultId = type === "privateKey"
    ? process.env.OP_PRIVATE_KEY_VAULT_ID!
    : process.env.OP_API_TOKEN_VAULT_ID!;

  try {
    const createdItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
      {
        headers: {
          Authorization: `Bearer ${vaultToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`🔑 Retrieved API Token from Vault`);
    return await createdItem.json();
  } catch (error: any) {
    const errMsg = `Failed to retrieve API Token from Vault: ${error?.message}`;
    console.error(`⛑️🔑 ${errMsg}`);
    throw new Error(errMsg);
  }
}

export async function replaceVaultItem(
  id: string,
  newData: any,
  type?: "apiKey" | "privateKey"
) {
  const vaultId = type === "privateKey"
    ? process.env.OP_PRIVATE_KEY_VAULT_ID!
    : process.env.OP_API_TOKEN_VAULT_ID!;

  const currentItemData = await getVaultItem(id, type);
  try {
    const updatedItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${vaultToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentItemData,
          ...newData,
        }),
      },
    );
    console.log(`✅🔑 Replaced Vault item`);
    return await updatedItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to replace Vault item \n ${error?.message}`);
  }
}

export async function updateVaultItem(
    id: string,
    newData: {op: "replace" | "add" | "remove", path: string, value: any}[],
    type?: "apiKey" | "privateKey",
) {
  const vaultId =
      type === "privateKey"
          ? process.env.OP_PRIVATE_KEY_VAULT_ID!
          : process.env.OP_API_TOKEN_VAULT_ID!;
  try {
    const updatedItem = await fetch(
        `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${vaultToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        },
    );
    console.log(`✅🔑 Updated Vault item`);
    return await updatedItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to update Vault item \n ${error?.message}`);
  }
}
