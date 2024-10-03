import { capsule } from "@/lib/capsule";
import { createVaultCapsuleKeyItem } from "@/lib/1pwd-vault";
import { StatusCodes } from "http-status-codes";
import { PregenIdentifierType, WalletType } from "@usecapsule/server-sdk";

export const createCapsuleAccount = async (email: string, type: AccountType) => {
  const hasWallet = await capsule.hasPregenWallet(email);
  if (!hasWallet) {
    try {
      const walletType = "EVM" as WalletType;
      const pregenIdentifierType = "EMAIL" as PregenIdentifierType;
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
    console.log("Pregenerated wallet already exists for this user");
  }
};