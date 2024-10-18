"use server";
import { CallWithERC2771Request, ERC2771Type, GelatoRelay, TransactionStatusResponse } from "@gelatonetwork/relay-sdk-viem";
import { getCapsuleSigner } from "@/lib/capsule";
import { StatusCodes } from "http-status-codes";
import { encodeFunctionData, TransactionReceipt } from "viem";
import { activeChain, contractArtifacts, getExplorerUrl, waitForTransactionReceipt } from "@/lib/viem";

interface MetaTxParams {
  contractName: string;
  functionName: string;
  args: any[];
  contractAddress: string;
  userWalletAddress: string;
  capsuleTokenVaultKey: string;
}

type MetaTxResult = {
  data?: {
    type: string;
    transactionReceipt?: TransactionReceipt;
    metaTransactionStatus?: TransactionStatusResponse;
  };
  error?: any;
  status?: number;
};

const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_TIME = 60000; // 1 minute

const getTaskStatusWithRetries = async (relay: GelatoRelay, taskId: string, maxRetries = 5, delay = 1000) => {
  try {
    return await relay.getTaskStatus(taskId);
  } catch (error) {
    if (error.message === "Status not found" && maxRetries > 0) {
      console.log(`Status not found. Retrying in ${delay}ms. Retries left: ${maxRetries - 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getTaskStatusWithRetries(relay, taskId, maxRetries - 1, delay);
    } else {
      throw error;
    }
  }
}

// 🏗️ TODO: clear console.logs after tested on prod

const pollTaskStatus = async (relay: GelatoRelay, taskId: string): Promise<TransactionStatusResponse> => {
  const startTime = Date.now();
  while (Date.now() - startTime < MAX_POLLING_TIME) {
    const taskStatus = await getTaskStatusWithRetries(relay, taskId);
    console.log("🌳 taskStatus: ", taskStatus)

    if (!["CheckPending", "ExecPending", "WaitingForConfirmation"].includes(taskStatus.taskState)) {
      return taskStatus;
    }

    if (taskStatus.lastCheckMessage) {
      return taskStatus;
    }

    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("Polling timed out");
};

const isErrorStatus = (taskStatus: TransactionStatusResponse): boolean => {
  if (taskStatus.lastCheckMessage && taskStatus.lastCheckMessage.toLowerCase().includes("error")) {
    return true;
  }
  return ["ExecReverted", "Cancelled"].includes(taskStatus.taskState);
};

export const metaTx = async ({
  contractAddress,
  contractName,
  functionName,
  args,
  userWalletAddress,
  capsuleTokenVaultKey
}: MetaTxParams): Promise<MetaTxResult> => {
  try {
    const relay = new GelatoRelay();
    const capsuleSigner = await getCapsuleSigner(capsuleTokenVaultKey);

    const data = encodeFunctionData({
      abi: contractArtifacts[contractName].abi,
      functionName: functionName,
      args: args
    }) as `0x${string}`;

    const request: CallWithERC2771Request = {
      chainId: BigInt(activeChain.id),
      target: contractAddress,
      data: data,
      user: userWalletAddress as `0x${string}`
    };

    const { struct, signature } = await relay.getSignatureDataERC2771(
      request,
      capsuleSigner as any,
      ERC2771Type.SponsoredCall
    );

    const relayResponse = await relay.sponsoredCallERC2771WithSignature(
      struct,
      signature,
      process.env.GELATO_RELAY_API_KEY
    );

    console.log("🔮 relayResponse: ", relayResponse)
    
    if (relayResponse?.taskId) {
      const taskStatus = await pollTaskStatus(relay, relayResponse.taskId);

      // relay.onTaskStatusUpdate((taskStatus: TransactionStatusResponse) => {
      //   console.log("Task status update", taskStatus);
      // });

      if (isErrorStatus(taskStatus)) {
        return {
          data: null,
          error: taskStatus.lastCheckMessage || `Task failed with state: ${taskStatus.taskState}`,
          status: StatusCodes.BAD_REQUEST
        }
      }

      const result = await waitForTransactionReceipt(taskStatus.transactionHash);

      console.log("✏️ result: ", result)

      return {
        data: {
          type: "meta-transaction",
          metaTransactionStatus: taskStatus,
          transactionReceipt: result
        },
        status: StatusCodes.OK
      };
    } else {
      return {
        data: null,
        error: relayResponse,
        status: StatusCodes.BAD_REQUEST
      }
    }

  } catch (error) {
    console.log("🚨 Gasless Transaction error:", error.message);
    return { error: error.message, status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};
