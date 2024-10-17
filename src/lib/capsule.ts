"use server";
import { Environment } from "@usecapsule/core-sdk";
import { Capsule, PregenIdentifierType, WalletType } from "@usecapsule/server-sdk";
import { createVaultCapsuleKeyItem, getVaultItem } from "@/lib/1pwd-vault";
import { StatusCodes } from "http-status-codes";
import { formatEmailToAvoidCapsuleConflict } from "@/utils/formatEmailToAvoidCapsuleConflict";
import { createCapsuleAccount as createCapsuleViemAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { activeChain, rpcUrl } from "@/lib/viem";
import { http } from "viem";

export const createCapsuleAccount = async (accountId: string, email: string, type: AccountType) => {
  const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY!);
  const isBetaEnv = process.env.NODE_ENV !== "production";
  const formattedEmail = formatEmailToAvoidCapsuleConflict(email, accountId);
  const hasWallet = await capsule.hasPregenWallet(accountId);
  const walletType = "EVM" as WalletType;
  const pregenIdentifierType = "EMAIL" as PregenIdentifierType;
  if (!hasWallet) {
    try {
      const { address } = await capsule.createWalletPreGen(walletType, formattedEmail, pregenIdentifierType) as { address: string };
      if (!address) {
        return { error: "Could not create a wallet, service temporarily not available.", status: StatusCodes.INTERNAL_SERVER_ERROR };
      }
      const userShare = capsule.getUserShare() as string;
      const vaultItem = await createVaultCapsuleKeyItem(userShare, address, email, type);
      const data = {
        capsuleTokenVaultKey: vaultItem.id,
        walletAddress: address?.toLowerCase()
      };
      return { data, status: StatusCodes.CREATED };
    } catch (e) {
      return { error: e, status: StatusCodes.INTERNAL_SERVER_ERROR };
    }
  } else {
    const wallets = await capsule.getPregenWallets(formattedEmail, pregenIdentifierType);
    const message = `‼️💳 Pregenerated wallet already exists \n User with ${email} has ${wallets.length} pregenerated wallets \n Potential databases/emails conflict`;
    return { error: message, status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};

export async function getCapsuleSigner(capsuleTokenVaultKey: string) {
  const capsuleOneTimeClient = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY!);
  const vaultItem = await getVaultItem(capsuleTokenVaultKey, "capsuleKey");
  console.log("📝 Vault item: ", vaultItem);
  const userShare = vaultItem.fields.find(i => i.id === "capsuleKey")?.value;
  console.log("📝 User share: ", userShare);
  await capsuleOneTimeClient.setUserShare(userShare);

  console.log("📝 User share: ", capsuleOneTimeClient.getUserShare());
  const account = createCapsuleViemAccount(capsuleOneTimeClient);
  console.log("📝 Account: ", account);
  const capsuleViemClient = createCapsuleViemClient(capsuleOneTimeClient, {
    chain: activeChain,
    transport: http(rpcUrl),
    account
  });

  console.log("📝 Capsule client: ", capsuleViemClient);

  console.log(`📝 Capsule signer: ${account.address}`);
  const accountInstance = {
    signMessage: (message: string) => account.signMessage({ message }),
    getAddress: () => Promise.resolve(account.address),
    signTypedData: (props: any) => account.signTypedData(props),
    getChainId: () => Promise.resolve(activeChain.id)
  } as any;
  return {
    ...capsuleViemClient,
    ...accountInstance
  };
};
