"use server";

import {shortenWalletAddress} from "@/utils/shortenWalletAddress";

const vaultApiUrl = process.env.VAULT_SERVER!;
const vaultToken = process.env.OP_API_TOKEN!;
const vaultId = process.env.VAULT_ID!;

export async function createVaultPrivateKeyItem(
  value: string,
  address: string,
  email: string,
  deployed: boolean
) {
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
          value: email
        },
        {
          id: "publicKey",
          type: "STRING",
          label: "Public key",
          value: address
        },
        {
          id: "privateKey",
          type: "CONCEALED",
          label: "Private key",
          value
        },
      ],
    }),
  });
  console.log(`🔑 Created vault item for: ${email}`);
  return await createdItem.json();
}
