import { encodeFunctionData } from "viem";
import { Bundler, createSmartAccountClient, LightSigner, PaymasterMode } from "@biconomy/account";
import { getVaultItem } from "@/lib/1pwd-vault";
import { contractArtifacts, getExplorerUrl, provider } from "@/lib/viem";
import { Capsule } from "@usecapsule/server-sdk";
import { Environment } from "@usecapsule/core-sdk";
import { CapsuleEthersV5Signer } from "@usecapsule/ethers-v5-integration";
import { StatusCodes } from "http-status-codes";

interface MetaTxParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: any[];
  capsuleTokenVaultKey: string;
  userWalletAddress?: string;
}

export const createSmartWallet = async (signer: LightSigner) =>
  createSmartAccountClient({
    signer: signer,
    bundlerUrl: `https://bundler.biconomy.io/api/v2/${process.env.NEXT_PUBLIC_CHAIN_ID}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
    biconomyPaymasterApiKey: process.env.BICONOMY_API_KEY, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
    rpcUrl: process.env.NEXT_PUBLIC_JSON_RPC_URL // <-- read about this at https://docs.biconomy.io/account/methods#createsmartaccountclient
  });

export const biconomyMetaTx = async ({
  contractAddress,
  contractName,
  functionName,
  args,
  capsuleTokenVaultKey
}: MetaTxParams) => {
  const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY);
  const vaultItem = await getVaultItem(capsuleTokenVaultKey, "capsuleKey");
  const userShare = vaultItem.fields.find((i) => i.id === "capsuleKey")?.value;
  await capsule.setUserShare(userShare);
  const ethersSigner = new CapsuleEthersV5Signer(capsule as any, provider);
  const smartWallet = await createSmartWallet(ethersSigner);

  const tx = {
    to: contractAddress,
    data: encodeFunctionData({
      abi: contractArtifacts[contractName].abi,
      functionName: functionName,
      args: args
    })
  };

  const smartWalletAddress = await smartWallet.getAddress();
  await provider.estimateGas({ from: smartWalletAddress, ...tx });

  const userOpResponse = await smartWallet.sendTransaction(tx, {
    paymasterServiceData: { mode: PaymasterMode.SPONSORED }
  });

  console.log("🫡 userOpResponse: ", userOpResponse);
  const { transactionHash } = await userOpResponse.waitForTxHash();

  console.log("💨 transactionHash", getExplorerUrl(transactionHash));

  let userOpReceipt;
  try {
    userOpReceipt = await userOpResponse.wait();
  } catch (error) {
    console.log("🚨 error while waiting for userOpResponse", error.message);
    const bundlerResponse = await bundler.getUserOpByHash(userOpResponse.userOpHash);
    if (!!bundlerResponse) {
      userOpReceipt = await userOpResponse.wait();
    }
  }

  console.log("🧾 userOpReceipt: ", userOpReceipt);

  if (userOpReceipt && userOpReceipt?.success == "true") {
    return {
      data: {
        type: "paymaster-tx",
        transactionReceipt: userOpReceipt.receipt
      },
      status: StatusCodes.OK
    };
  } else {
    return {
      data: null,
      error: userOpResponse ?? userOpReceipt,
      status: StatusCodes.BAD_REQUEST
    };
  }
};

export const bundler = new Bundler({
  bundlerUrl: `https://bundler.biconomy.io/api/v2/${process.env.NEXT_PUBLIC_CHAIN_ID}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44` // Replace with Base Sepolia chain ID
});
