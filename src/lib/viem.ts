import { ethers } from "ethers";
import { NonceManager } from "@ethersproject/experimental";
import { importAllJsonContractsArtifacts } from "@/lib/contracts/interfaces";
import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const rpcUrl = process.env.NEXT_PUBLIC_JSON_RPC_URL || "define RPC URL env ";
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532;
export const ethNativeCurrency = {
  decimals: 18,
  name: "ETH",
  symbol: "ETH"
};
export const baseSepolia = {
  id: chainId,
  name: "BaseSepolia",
  nativeCurrency: ethNativeCurrency,
  rpcUrls: {
    default: {
      http: [rpcUrl],
      webSocket: [""]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://sepolia.basescan.org"
    }
  }
};
export const activeChain = baseSepolia;

export const account = privateKeyToAccount(`0x${process.env.OPERATOR_PRIVATE_KEY}`);

const client = createWalletClient({
  chain: activeChain,
  account,
  transport: http(rpcUrl)
});

const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(rpcUrl)
});

let nonce;

const initializeNonce = async () => {
  nonce = await fetchNonce();
};

const incrementNonce = () => {
  nonce += 1;
};

export const fetchNonce = async (address: string | null = null) => {
  const provider = new ethers.providers.JsonRpcProvider({
    skipFetchSetup: true,
    fetchOptions: {
      referrer: process.env.NEXT_PUBLIC_BASE_URL!
    },
    url: rpcUrl!
  });

  const signer = provider.getSigner(account?.address);
  const nonceManager = new NonceManager(signer);
  return nonceManager.getTransactionCount("latest");
};

export const getExplorerUrl = (param: string): string => {
  if (param.length === 66) {
    return `${activeChain.blockExplorers.default.url}/tx/${param}`;
  } else if (param.length === 42) {
    return `${activeChain.blockExplorers.default.url}/address/${param}`;
  } else {
    throw new Error("Invalid input: must be a valid Ethereum address (40 signs) or transaction hash (64 signs)");
  }
};

export const deployContract = async (contractName, args) => {
  const contractArtifacts = importAllJsonContractsArtifacts();
  const hash = await client.deployContract({
    abi: contractArtifacts[contractName].abi,
    bytecode: contractArtifacts[contractName].bytecode?.object || contractArtifacts[contractName].bytecode,
    args,
    chain: undefined
  });

  let contractAddr;

  const receipt = await publicClient.waitForTransactionReceipt({
    confirmations: 5,
    hash
  });

  if (receipt?.contractAddress) {
    contractAddr = getAddress(receipt.contractAddress);
  }

  return { hash, contractAddr };
};

export const waitForTransactionReceipt = async (hash, confirmations = 1) => {
  return publicClient.waitForTransactionReceipt({
    hash,
    confirmations
  });
};

export const writeContractWithNonceGuard = async (contractAddr, functionName, args, abi, sellerId) => {
  await initializeNonce();
  try {
    const hash = await client.writeContract({
      address: contractAddr,
      functionName: functionName,
      args,
      abi,
      account,
      nonce
    } as any);
    console.log(`📟 ${functionName}TxHash: ${getExplorerUrl(hash)} 📟 Nonce: ${nonce}`);
    return waitForTransactionReceipt(hash);
  } catch (error) {
    const errorMessage = `Details: ${(error as any).message.split("Details:")[1]}`;
    console.log(`🚨 Error while calling ${functionName}: `, errorMessage);
    if (errorMessage.includes("nonce too low")) {
      console.log(`🆘 incrementing nonce (currently ${nonce})!`);
      nonce++;
      return await writeContractWithNonceGuard(contractAddr, functionName, args, abi, sellerId);
    } else {
      console.log("🔮 error: ", error);
      // await createErrorLog(sellerId, (error as any).message);
    }
  }
};

export const readContract = async (address, abi, functionName, args = null) => {
  return publicClient.readContract({
    address,
    abi,
    functionName,
    args
  });
};

export const writeContract = async (contractAddr, functionName, args, abi) => {
  await initializeNonce();
  const hash = await client.writeContract({
    address: contractAddr,
    functionName: functionName,
    args,
    abi,
    account,
    nonce
  } as any);
  console.log(`📟 ${functionName}TxHash: ${getExplorerUrl(hash)} 📟 Nonce: ${nonce}`);
  return waitForTransactionReceipt(hash);
};

export const contractArtifacts = importAllJsonContractsArtifacts();