"use server";

import { getUserIdByEmail } from "@/server/api/accounts/getUserIdByEmail";
import { getAccountInstance } from "@/server/api/accounts/getAccountInstance";
import {
  gaslessTransaction,
  getGaslessTransactionCallData,
} from "@/services/gaslessTransaction";
import connectToContract from "@/services/connectToContract";
import interactWithContract from "@/services/interactWithContract";

export async function entranceEntry(enteredEmail, contractAddress) {
  try {
    const userId = await getUserIdByEmail(enteredEmail);
    const { account } = await getAccountInstance({ userId });
    const contract = connectToContract({
      name: "EntranceChecker",
      address: contractAddress,
    });
    contract.connect(account);
    const alreadyEntered = await interactWithContract(
      "get_entry",
      [account.address],
      contract,
    );
    if (Number(alreadyEntered) > 0) {
      return {
        message: "Already entered",
        enteredTimestamp: alreadyEntered * 1000,
      };
    }
    const calls = getGaslessTransactionCallData(
      "entry",
      contractAddress,
      {},
      contract.abi,
    );

    const resultTxHash = await gaslessTransaction(account, calls);

    return {
      txHash: resultTxHash.transactionHash,
      message: "Successfully entered",
      enteredTimestamp: new Date().getTime(),
    };
  } catch (e) {
    return { error: e?.message || "Unknown error" };
  }
}
