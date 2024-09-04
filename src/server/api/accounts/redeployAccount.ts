"use server";

import { developerAccountModel } from "@/prisma/models";
import { getVaultItem, updateVaultItem } from "@/server/api/vault/vaultApi";
import {
  Account,
  CallData,
  constants,
  Contract,
  hash,
  RpcProvider,
} from "starknet";
import { ethers } from "ethers";
import { gaslessTransaction } from "@/services/gaslessTransaction";
import ethAbi from "@/contracts/abis/ethAbi.json";
import { bigIntToHex } from "@/utils/numberConverts";

export async function redeployDevAccount(id: string) {
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

  const devAccount = await developerAccountModel.findUnique({
    where: {
      id,
    },
  });
  if (!devAccount) {
    throw new Error("Developer account not found");
  }

  const keys = await getVaultItem(devAccount.vaultKey, "privateKey");

  if (!keys) {
    throw new Error("Keys not found");
  }

  const publicKey = keys.fields.find(
    (field) => field.id === "publicKey",
  )?.value;
  const privateKey = keys.fields.find(
    (field) => field.id === "privateKey",
  )?.value;

  const AXConstructorCallData = CallData.compile({
    owner: publicKey,
    guardian: "0",
  });
  const AXcontractAddress = hash.calculateContractAddressFromHash(
      publicKey,
    argentXaccountClassHash,
    AXConstructorCallData,
    0,
  );

  const accountAX = new Account(provider, AXcontractAddress, privateKey);
  const deployAccountPayload = {
    classHash: argentXaccountClassHash,
    constructorCalldata: AXConstructorCallData,
    contractAddress: AXcontractAddress,
    addressSalt: publicKey,
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
      `💎 Sending initial funds to the ArgentX account by gasless... (${ethers.formatEther(suggestedMaxFee)} ETH)`,
    );
    const hexNumber = bigIntToHex(suggestedMaxFee);
    const gaslessTransferTx = await gaslessTransaction(operatorAccount, [
      {
        entrypoint: "transfer",
        contractAddress: ethContractAddress,
        calldata: [`${AXcontractAddress}`, `${hexNumber}`, `0x0`],
      },
    ]);

    if (!!gaslessTransferTx?.error) {
      console.log(
        `❌ Error with sending initial funds by gasless... ${gaslessTransferTx.error}`,
      );
    } else {
      console.log(
        `✅ Initial funds sent by gasless... txHash: ${gaslessTransferTx.transactionHash}`,
      );
      transferInitialFundsTx = gaslessTransferTx.transactionHash;
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
  const { transaction_hash: AXdAth, contract_address: AXcontractFinalAddress } =
    await accountAX.deployAccount(deployAccountPayload);

  if (AXcontractFinalAddress) {
    await developerAccountModel.update({
      where: {
        id,
      },
      data: {
        accountDeployed: true,
        walletAddress: AXcontractFinalAddress,
      },
    });
    await updateVaultItem(
      devAccount.vaultKey,
      [
        {
          op: "replace",
          path: "/tags/0",
          value: "deployed",
        },
        {
          op: "replace",
          path: "/tags/1",
          value: "sepolia",
        },
      ],
      "privateKey",
    );
    console.log(
      `✅ ArgentX wallet created & deployed: \n  - Final contract address: ${AXcontractFinalAddress}`,
    );
  }
  return { AXcontractFinalAddress, accountDeployed: true };
}
