"use server";
import { shortenWalletAddress } from "@/utils/shortenWalletAddress";

const vaultApiUrl = process.env.OP_VAULT_SERVER_HOST!;
const vaultToken = process.env.OP_API_TOKEN!;

export async function createVaultPrivateKeyItem(
  value: string,
  address: string,
  email: string,
  deployed: boolean,
) {
  const vaultId = process.env.OP_PRIVATE_KEY_VAULT_ID!;
  try {
    const createdItem = await fetch(`${vaultApiUrl}/vaults/${vaultId}/items`, {
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
            id: "publicKey",
            type: "STRING",
            label: "Public key",
            value: address,
          },
          {
            id: "privateKey",
            type: "CONCEALED",
            label: "Private key",
            value,
          },
        ],
      }),
    });
    console.log(`🔑 Created Key Pair in Vault for: ${email}`);
    return createdItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to create Key Pair in Vault for: ${email} \n ${error?.message}`);
  }
}

export async function createVaultApiTokenItem(userId: string, deployed: boolean) {
  const vaultId = process.env.OP_API_TOKEN_VAULT_ID!;
  try {
    const createdItem = await fetch(`${vaultApiUrl}/v1/vaults/${vaultId}/items`, {
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
        title: "Vault API Token Item from blessed-dashboard 🤡",
        category: "API_CREDENTIAL",
        tags: [deployed ? "deployed" : "undeployed"],
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
            generate: true,
            recipe: {
              length: 64,
              characterSets: ["LETTERS", "DIGITS"],
            },
          },
        ],
      }),
    });
    console.log(`🔑 Created API Token in Vault for User: ${userId}`);
    return await createdItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to create API Token in Vault for User: ${userId} \n ${error?.message}`);
  }
}
