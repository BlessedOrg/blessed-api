import { Environment } from "@usecapsule/core-sdk";
import { Capsule, PregenIdentifierType, WalletType } from "@usecapsule/server-sdk";
import { createVaultCapsuleKeyItem } from "@/lib/1pwd-vault";
import { StatusCodes } from "http-status-codes";

export const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY!);

export const createCapsuleAccount = async (email: string, type: AccountType) => {
  const hasWallet = await capsule.hasPregenWallet(email);
  const walletType = "EVM" as WalletType;
  const pregenIdentifierType = "EMAIL" as PregenIdentifierType;
  if (!hasWallet) {
    try {
      const { address } = await capsule.createWalletPreGen(walletType, email, pregenIdentifierType);
      const userShare = capsule.getUserShare();
      const vaultItem = await createVaultCapsuleKeyItem(userShare, address, email, type);
      const data = {
        capsuleTokenVaultKey: vaultItem.id,
        walletAddress: address
      };
      return { data, status: StatusCodes.CREATED };
    } catch (e) {
      return { error: e, status: StatusCodes.INTERNAL_SERVER_ERROR };
    }
  } else {
    const wallets = await capsule.getPregenWallets(email, pregenIdentifierType);
    console.log(`💳 User with ${email} has ${wallets.length} pregenerated wallets`);
    console.log("‼️Pregenerated wallet already exists for this user, fetching share from Vault");
  }
};
