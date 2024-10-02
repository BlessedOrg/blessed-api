import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http } from "viem";
import { ethers } from "ethers";
import { NonceManager } from "@ethersproject/experimental";
import { importAllJsonContractsArtifacts } from "@/contracts/interfaces";

export const rpcUrl = process.env.NEXT_PUBLIC_JSON_RPC_URL || "define RPC URL env ";
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 0;
export const ethNativeCurrency = {
  decimals: 18,
  name: "Ether",
  symbol: "ETH",
}
const baseSepolia = {
  id: chainId,
  name: "Base Sepolia",
  nativeCurrency: ethNativeCurrency,
  rpcUrls: {
    default: {
      http: [rpcUrl],
      webSocket: [""],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://sepolia.basescan.org",
    },
  },
}
export const activeChain = baseSepolia;
const account = privateKeyToAccount(`0x${process.env.OPERATOR_PRIVATE_KEY}`);

const client = createWalletClient({
  chain: activeChain,
  account,
  transport: http(rpcUrl),
});

const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(rpcUrl),
});

let nonce;

const initializeNonce = async () => {
  nonce = await fetchNonce();
};

const incrementNonce = () => {
  nonce += 1;
};

const fetchNonce = async (address: string | null = null) => {
  const provider = new ethers.providers.JsonRpcProvider({
    skipFetchSetup: true,
    fetchOptions: {
      referrer: process.env.NEXT_PUBLIC_BASE_URL!,
    },
    url: rpcUrl!,
  });
  const signer = provider.getSigner(account?.address);
  const nonceManager = new NonceManager(signer);
  const nonceFromManager = await nonceManager.getTransactionCount("latest");
  console.log("🔥 nonceFromManager: ", nonceFromManager);
  return nonceFromManager;
};

const getExplorerUrl = (param: string): string => {
  if (param.length === 66) {
    return `${activeChain.blockExplorers.default.url}/tx/${param}`;
  } else if (param.length === 42) {
    return `${activeChain.blockExplorers.default.url}/address/${param}`;
  } else {
    throw new Error("Invalid input: must be a valid Ethereum address (40 signs) or transaction hash (64 signs)");
  }
};

const deployContract = async (contractName, args) => {
  const contractArtifacts = importAllJsonContractsArtifacts();
  const hash = await client.deployContract({
    abi: contractArtifacts[contractName].abi,
    bytecode: contractArtifacts[contractName].bytecode.object,
    args,
    chain: undefined
  });

  let contractAddr;

  const receipt = await publicClient.waitForTransactionReceipt({
    confirmations: 5,
    hash,
  });

  if (receipt?.contractAddress) {
    contractAddr = receipt.contractAddress;
  }

  return { hash, contractAddr };
};

const waitForTransactionReceipt = async (hash, confirmations = 1) => {
  return publicClient.waitForTransactionReceipt({
    hash,
    confirmations,
  });
};


const writeContractWithNonceGuard = async (contractAddr, functionName, args, abi, sellerId) => {
  await initializeNonce();
  try {
    const hash = await client.writeContract({
      address: contractAddr,
      functionName: functionName,
      args,
      abi,
      account,
      nonce,
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
      console.log("🔮 error: ", error)
      // await createErrorLog(sellerId, (error as any).message);
    }
  }
};

const contractArtifacts = importAllJsonContractsArtifacts();


export {
  nonce,
  account,
  client,
  contractArtifacts,
  publicClient,
  writeContractWithNonceGuard,
  fetchNonce,
  getExplorerUrl,
  deployContract
}