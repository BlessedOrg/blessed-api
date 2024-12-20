"use server";
import { Capsule, PregenIdentifierType, WalletType } from "@usecapsule/server-sdk";
import { createVaultCapsuleKeyItem, getVaultItem } from "@/lib/1pwd-vault";
import { StatusCodes } from "http-status-codes";
import { formatEmailToAvoidCapsuleConflict } from "@/utils/formatEmailToAvoidCapsuleConflict";
import { createCapsuleAccount as createCapsuleViemAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { activeChain, provider, rpcUrl } from "@/lib/viem";
import { http } from "viem";
import { CapsuleEthersV5Signer } from "@usecapsule/ethers-v5-integration";
import { createSmartWallet } from "@/lib/biconomy";

const capsuleEnv = process.env.CAPSULE_ENV as any;
const getCapsuleInstance = () =>
  new Capsule(capsuleEnv, process.env.CAPSULE_API_KEY, {
    supportedWalletTypes: {
      EVM: true
    }
  });

export const createCapsuleAccount = async (accountId: string, email: string, type: AccountType) => {
  const capsule = getCapsuleInstance();
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
      const ethersSigner = new CapsuleEthersV5Signer(capsule as any, provider);
      const smartWallet = await createSmartWallet(ethersSigner);
      const smartWalletAddress = await smartWallet.getAddress();
      const vaultItem = await createVaultCapsuleKeyItem(userShare, address, email, type);
      const data = {
        capsuleTokenVaultKey: vaultItem.id,
        walletAddress: address?.toLowerCase(),
        smartWalletAddress: smartWalletAddress?.toLowerCase()
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
  const capsule = getCapsuleInstance();
  const vaultItem = await getVaultItem(capsuleTokenVaultKey, "capsuleKey");
  const userShare = vaultItem.fields.find((i) => i.id === "capsuleKey")?.value;
  await capsule.setUserShare(userShare);
  const account = createCapsuleViemAccount(capsule);
  const capsuleViemClient = createCapsuleViemClient(capsule, {
    chain: activeChain,
    transport: http(rpcUrl) as any,
    account
  });

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

export async function getSmartWalletForCapsuleWallet(capsuleTokenVaultKey: string) {
  const capsuleEnv = process.env.CAPSULE_ENV as any;
  const capsule = new Capsule(capsuleEnv, process.env.CAPSULE_API_KEY);
  const vaultItem = await getVaultItem(capsuleTokenVaultKey, "capsuleKey");
  const userShare = vaultItem.fields.find((i) => i.id === "capsuleKey")?.value;
  await capsule.setUserShare(userShare);

  const ethersSigner = new CapsuleEthersV5Signer(capsule as any, provider);
  return createSmartWallet(ethersSigner);
}