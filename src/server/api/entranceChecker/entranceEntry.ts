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
    const { account, accountData } = await getAccountInstance({ userId });
    const entranceContract = connectToContract({
      name: "EntranceChecker",
      address: contractAddress,
    });
    entranceContract.connect(account);

    const alreadyEntered = await interactWithContract(
      "get_entry",
      [account.address],
      entranceContract,
    );

    if (Number(alreadyEntered) > 0) {
      const enteredDate = new Date((alreadyEntered * 1000));
      return {
        message: `Already entered, scan the NFC. Entered at ${enteredDate.toLocaleDateString()} - 
          ${enteredDate.toLocaleTimeString()}}`,
      };
    }

    const erc1155ContractAddress = await interactWithContract(
      "get_erc1155",
      [],
      entranceContract,
    );

    const ticketContract = connectToContract({
      name: "ERC1155EventTicket",
      address: erc1155ContractAddress,
    });

    const hasTicket = await interactWithContract(
      "balanceOf",
      [account.address, 1],
      ticketContract,
    );

    console.log(hasTicket)
    if (!hasTicket || !Number(hasTicket)) {
      return { error: "You don't have a ticket to enter." };
    }

    const calls = getGaslessTransactionCallData({
      method: "entry",
      contractAddress,
      body: { tokenId: 1 },
      abiFunctions: entranceContract.abi,
    });

    const resultTxHash = await gaslessTransaction(account, calls);

    if (resultTxHash.error) {
      return { error: resultTxHash.error };
    }
    return {
      txHash: resultTxHash.transactionHash,
      message: "Entered successfully, please scan the NFC.",
      userData: {
        email: accountData.email,
        walletAddress: accountData.walletAddress
      }
    };
  } catch (e) {
    console.log(e);
    return { error: e?.message || "Unknown error" };
  }
}
