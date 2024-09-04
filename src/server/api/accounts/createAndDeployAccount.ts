"use server";
import { Account, CallData, constants, Contract, ec, hash, RpcProvider, stark } from "starknet";
import ethAbi from "@/contracts/abis/ethAbi.json";
import { ethers } from "ethers";
import { createVaultPrivateKeyItem } from "@/server/api/vault/vaultApi";
import { gaslessTransaction } from "@/services/gaslessTransaction";
import { bigIntToHex } from "@/utils/numberConverts";

export async function createAndDeployAccount(email: string) {
  const provider = new RpcProvider({
    nodeUrl: constants.NetworkName.SN_SEPOLIA,
  });

  // Argent
  const argentXaccountClassHash =
    process.env.NEXT_PUBLIC_ARGENT_ACCOUNT_CLASS_HASH!;

  //Operator account
  const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY!;
  const operatorWalletAddress = process.env.OPERATOR_WALLET_ADDR!;
  if (
    !operatorPrivateKey ||
    !operatorWalletAddress ||
    !argentXaccountClassHash
  ) {
    throw new Error("Missing operator/argent environment variables");
  }
  const operatorAccount = new Account(
    provider,
    operatorWalletAddress,
    operatorPrivateKey,
  );

  //ETH contract
  const ethContractAddress = process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!;
  if (!ethContractAddress) {
    throw new Error("Missing ETH environment variables");
  }
  const ethContract = new Contract(ethAbi, ethContractAddress, operatorAccount);

  // Generate public and private key pair.
  const privateKeyAX = stark.randomAddress();
  const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
  // Calculate future address of the ArgentX account
  const AXConstructorCallData = CallData.compile({
    owner: starkKeyPubAX,
    guardian: "0",
  });
  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    argentXaccountClassHash,
    AXConstructorCallData,
    0,
  );
  if (!!AXcontractAddress) {
    console.log(
      `📝 Successfully created account with credentials: \n  - private key : ${privateKeyAX}  \n  - public key: ${starkKeyPubAX} \n  - precalculated address: ${AXcontractAddress}`,
    );
  }

  const accountAX = new Account(provider, AXcontractAddress, privateKeyAX);
  const deployAccountPayload = {
    classHash: argentXaccountClassHash,
    constructorCalldata: AXConstructorCallData,
    contractAddress: AXcontractAddress,
    addressSalt: starkKeyPubAX,
  };
  console.log(`🔄 Estimating deploy fee for ArgentX account...`);
  const { suggestedMaxFee } = await accountAX.estimateAccountDeployFee({
    classHash: argentXaccountClassHash,
    constructorCalldata: AXConstructorCallData,
    contractAddress: AXcontractAddress,
  });
  console.log(
    `💰 Suggested max fee ETH: ${ethers.formatEther(suggestedMaxFee)} | BigInt: ${suggestedMaxFee}`,
  );

  ethContract.connect(operatorAccount);

  let transferInitialFundsTx = "";

  try {
    console.log(
      `💎🆓 Sending initial funds to the ArgentX account by gasless... (${ethers.formatEther(suggestedMaxFee)} ETH)`,
    );

    const hexNumber = bigIntToHex(suggestedMaxFee);
    const gaslessTransferTx = await gaslessTransaction(operatorAccount, [
      {
        entrypoint: "transfer",
        contractAddress: ethContractAddress,
        calldata: [`${AXcontractAddress}`, `${hexNumber}`, `0x0`],
      },
    ]);
    if (!!gaslessTransferTx?.transactionHash) {
      console.log(
        `✅🆓 Initial funds sent by gasless... txHash: ${gaslessTransferTx.transactionHash}`,
      );
      transferInitialFundsTx = gaslessTransferTx.transactionHash;
    } else {
      console.log(
          `❌ Error with sending initial funds by gasless... ${gaslessTransferTx.error}`,
      );
    }
  } catch (e) {
    console.log(`❌ Error with sending initial funds by gasless... ${e}`);
  }

  if (!transferInitialFundsTx) {
    console.log(
      `💎 Sending initial funds to the ArgentX account by operator... (${ethers.formatEther(suggestedMaxFee)} ETH)`,
    );
    const transferTx: any = await ethContract.transfer(
      AXcontractAddress,
      suggestedMaxFee,
    );
    transferInitialFundsTx = transferTx.transaction_hash;
  }

  console.log(`🔄 Waiting for transaction confirmation...`);

  const confirmation = await provider.waitForTransaction(
    transferInitialFundsTx,
  );

  if (confirmation.statusReceipt === "success") {
    console.log(
      "🚀 Successfully transfer initial funds to the ArgentX account",
    );
  }

  console.log("🔄 Deploying ArgentX account...");
  const deployStatus = await deployAccountAndCreateVaultItem(
    accountAX,
    privateKeyAX,
    deployAccountPayload,
    starkKeyPubAX,
    email,
  );
  return deployStatus;
}

const deployAccountAndCreateVaultItem = async (
  accountAX: Account,
  privateKeyAX: string,
  deployAccountPayload: any,
  starkKeyPubAX: string,
  email: string,
) => {
  try {
    const {
      transaction_hash: AXdAth,
      contract_address: AXcontractFinalAddress,
    } = await accountAX.deployAccount(deployAccountPayload);

    if (AXcontractFinalAddress) {
      console.log(
        `✅ ArgentX wallet created & deployed: \n  - Final contract address: ${AXcontractFinalAddress}`,
      );
    }
    const vaultData = await createVaultPrivateKeyItem(
      privateKeyAX,
      starkKeyPubAX,
      AXcontractFinalAddress,
      email,
      true,
    );
    return {
      message: "✅ ArgentX wallet created & deployed",
      contractAddress: AXcontractFinalAddress,
      privateKey: privateKeyAX,
      publicKey: starkKeyPubAX,
      vaultKey: vaultData?.id,
    };
  } catch (e) {
    const error = e as any;
    console.log(error);
    const vaultData = await createVaultPrivateKeyItem(
      privateKeyAX,
      starkKeyPubAX,
      accountAX.address,
      email,
      false,
    );
    return {
      message: "❌ ArgentX wallet deployment failed",
      error: error?.message,
      vaultKey: vaultData?.id,
    };
  }
};