"use server";
import { Abi, Account, Contract } from "starknet";
import { gaslessTransaction, getGaslessTransactionCallData } from "@/server/services/gaslessTransaction";
import { getExplorerUrl } from "@/utils/getExplorerUrl";

export async function gaslessTransactionWithFallback(
  account: Account,
  functionName: string,
  contract: Contract,
  body: {
    [key: string]: any;
  },
  abiFunctions: any[] | Abi,
  withUserWalletFallback = true
) {
  const calldata = getGaslessTransactionCallData({
    method: functionName,
    contractAddress: contract.address,
    body,
    abiFunctions
  });

  const gaslessTransactionResult = await gaslessTransaction(account, calldata);

  if (!!gaslessTransactionResult?.transactionHash) {
    return {
      txHash: gaslessTransactionResult.transactionHash,
      url: getExplorerUrl(gaslessTransactionResult.transactionHash, "hash"),
      type: "gasless"
    };
  } else if (withUserWalletFallback) {
    try {
      contract.connect(account);
      let userTransactionResult = await contract[functionName](...Object.values(body));
      if (typeof userTransactionResult === "bigint") {
        userTransactionResult = `0x${userTransactionResult.toString(16)}`;
      }
      return {
        txHash: userTransactionResult,
        gaslessError: gaslessTransactionResult.error,
        type: "wallet"
      };
    } catch (e) {
      return { error: e.message };
    }
  }
}
