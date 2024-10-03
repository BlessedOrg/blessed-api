"use server";
import { shortenWalletAddress } from "@/utils/shortenWalletAddress";

const vaultApiUrl = process.env.OP_VAULT_SERVER_HOST!;
const vaultToken = process.env.OP_API_TOKEN!;
const vaultCapsuleTokensId = process.env.OP_CAPSULE_KEY_VAULT_ID!;
const vaultAccessTokensId = process.env.OP_ACCESS_TOKEN_VAULT_ID!;
const headers = {
  Authorization: `Bearer ${vaultToken}`,
  "Content-Type": "application/json"
};
type IdPerType = {
  [K in VaultItemType]: string
};

const idPerType: IdPerType = {
  "capsuleKey": vaultCapsuleTokensId,
  "accessToken": vaultAccessTokensId
};
export async function createVaultCapsuleKeyItem(
  value: string,
  address: string,
  email: string,
  type: AccountType
) {
  const vaultId = vaultCapsuleTokensId;
  try {
    const createdItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          vault: {
            id: vaultId
          },
          title: `Capsule Token for ${type}: ${shortenWalletAddress(address)}`,
          category: "LOGIN",
          tags: [type],
          fields: [
            {
              id: "email",
              type: "STRING",
              label: "Email",
              value: email
            },
            {
              id: "walletAddress",
              type: "STRING",
              label: "Wallet address",
              value: address
            },
            {
              id: "capsuleKey",
              type: "CONCEALED",
              label: "Capsule key",
              value
            }
          ]
        })
      }
    );
    console.log(`🔑 Created Capsule Key Pair in Vault for: ${email}`);
    return await createdItem.json();
  } catch (error: any) {
    console.log(
      `⛑️🔑 Failed to create Capsule Key in Vault for: ${email} \n ${error?.message}`
    );
  }
}

export async function createVaultAccessTokenItem(apiToken: string, developerId: string) {
  const vaultId = vaultAccessTokensId;
  try {
    const createdItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          vault: {
            id: vaultId
          },
          title: `Access Token for developer ${developerId}`,
          category: "API_CREDENTIAL",
          tags: ["accessToken"],
          fields: [
            {
              id: "developerId",
              type: "STRING",
              label: "User ID",
              value: developerId
            },
            {
              id: "accessToken",
              label: "Access Token",
              type: "CONCEALED",
              value: apiToken
            }
          ]
        })
      }
    );
    console.log(`🔑 Created Access Token in Vault for developer: ${developerId}`);
    return await createdItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to create Access Token in Vault for developer: ${developerId} \n ${error?.message}`);
  }
}

export async function getVaultItem(id: string, type?: VaultItemType) {
  const vaultId = idPerType[type];

  const createdItem = await fetch(
    `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
    {
      headers: {
        Authorization: `Bearer ${vaultToken}`,
        "Content-Type": "application/json"
      }
    }
  );
  const vaultItem = await createdItem.json();
  if (vaultItem?.status !== 400) {
    console.log(`🔑 Retrieved Access Token from Vault`);
  } else {
    const errMsg = `Failed to retrieve Access Token from Vault: ${vaultItem?.message}`;
    console.error(`⛑️🔑 ${errMsg}`);
    throw new Error(errMsg);
  }
  return vaultItem;
}

export async function replaceVaultItemFields(
  id: string,
  newData: any,
  type?: VaultItemType
) {
  const vaultId = idPerType[type];

  const currentItemData = await getVaultItem(id, type);
  try {
    const updatedItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...currentItemData,
          fields: [
            ...currentItemData.fields,
            ...newData
          ]
        })
      }
    );
    console.log(`✅🔑 Replaced Vault item`);
    return await updatedItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to replace Vault item \n ${error?.message}`);
  }
}

export async function updateVaultItem(
  id: string,
  newData: { op: "replace" | "add" | "remove", path: string, value: any }[],
  type?: VaultItemType
) {
  const vaultId = idPerType[type];
  try {
    const updatedItem = await fetch(
      `${vaultApiUrl}/v1/vaults/${vaultId}/items/${id}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(newData)
      }
    );
    console.log(`✅🔑 Updated Vault item`);
    return await updatedItem.json();
  } catch (error: any) {
    console.log(`⛑️🔑 Failed to update Vault item \n ${error?.message}`);
  }
}