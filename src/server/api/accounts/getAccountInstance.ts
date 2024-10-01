"use server";
import { developerAccountModel, developersUserAccountModel } from "@/prisma/models";
import { getVaultItem } from "@/server/api/vault/vaultApi";
import { retrieveWalletCredentials } from "@/utils/retrieveWalletCredentials";
import { Account } from "starknet";
import provider from "@/contracts/cairo/provider";

type GetAccountInstanceProps = { developerId: string; userId?: never } | { developerId?: never; userId: string };

export const getAccountInstance = async ({ developerId, userId }: GetAccountInstanceProps) => {
  const accountData = !!developerId
    ? await developerAccountModel.findUnique({ where: { id: developerId } })
    : await developersUserAccountModel.findUnique({ where: { id: userId } });
  const keys = await getVaultItem(accountData.vaultKey, "privateKey");
  const { walletAddress, privateKey, publicKey } = retrieveWalletCredentials(keys);
  const account = new Account(provider, walletAddress, privateKey);

  return {
    account,
    accountData,
    publicKey,
    walletAddress,
  };
};

export const getAccountData = async ({ developerId, userId }: GetAccountInstanceProps) => {
  const accountData = !!developerId
    ? await developerAccountModel.findUnique({ where: { id: developerId }, include: { ApiTokens: true } })
    : await developersUserAccountModel.findUnique({ where: { id: userId } });

  return accountData;
};
