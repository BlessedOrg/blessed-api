"use server";

import { developerAccountModel } from "@/prisma/models";
import { getVaultPrivateKeyItem } from "@/server/vaultApi";
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

export async function redeployDevAccount(id: string) {
  const provider = new RpcProvider({
    nodeUrl: constants.NetworkName.SN_SEPOLIA,
  });

  // Argent
  const argentXaccountClassHash =
    process.env.NEXT_PUBLIC_ARGENT_ACCOUNT_CLASS_HASH!;

  //Operator account
  const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY!;
  const operatorPublicKey = process.env.OPERATOR_PUBLIC_KEY!;
  if (!operatorPrivateKey || !operatorPublicKey || !argentXaccountClassHash) {
    throw new Error("Missing operator/argent environment variables");
  }

  const operatorAccount = new Account(
    provider,
    operatorPublicKey,
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

  const keys = await getVaultPrivateKeyItem(devAccount.vaultKey);

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
    `💰 Suggested max fee ETH: ${ethers.formatEther(suggestedMaxFee)}`,
  );

  console.log(
    `💎 Sending initial funds to the ArgentX account by gasless... (${ethers.formatEther(suggestedMaxFee)} ETH)`,
  );
  ethContract.connect(operatorAccount);
  console.log(`Account address: ${accountAX.address}`);
  console.log(`Suggested max fee HEX: 0x${suggestedMaxFee.toString(16)}`);
  let transferInitialFundsTx = "";

  try {
    const decimalNumber = Number(suggestedMaxFee);
    const hexNumber = "0x" + decimalNumber.toString(16);
    const gaslessTransferTx = await gaslessTransaction(operatorAccount, [
      {
        entrypoint: "transfer",
        contractAddress: ethContract.address,
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
    console.log("🔄 Waiting for transaction confirmation...");
    const confirmation = await provider.waitForTransaction(
      transferInitialFundsTx,
    );

    if (confirmation.statusReceipt === "success") {
      console.log(
        "🚀 Successfully transfer initial funds to the ArgentX account",
      );
    }
  } catch (e) {
    console.log(e);
  }

  if(!transferInitialFundsTx) {
    console.log(
        `💎 Sending initial funds to the ArgentX account by operator... (${ethers.formatEther(suggestedMaxFee)} ETH)`,
    );
    const transferTx: any = await ethContract.transfer(
        AXcontractAddress,
        suggestedMaxFee,
    );
    transferInitialFundsTx = transferTx;
  }

  console.log(`🔄 Waiting for transaction confirmation...`);
  console.log(transferInitialFundsTx);
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
    console.log(
      `✅ ArgentX wallet created & deployed: \n  - Final contract address: ${AXcontractFinalAddress}`,
    );
  }
  return { AXcontractFinalAddress };
}
