"use server";

import { getUserIdByEmail } from "@/server/api/accounts/getUserIdByEmail";
import { getAccountInstance } from "@/server/api/accounts/getAccountInstance";
import {
  gaslessTransaction,
  getGaslessTransactionCallData,
} from "@/services/gaslessTransaction";
import connectToContract from "@/services/connectToContract";
import interactWithContract from "@/services/interactWithContract";
import {
  smartContractInteractionModel,
  smartContractModel,
} from "@/prisma/models";

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
      const enteredDate = new Date(alreadyEntered * 1000);
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
    const bigIntAddress = BigInt(erc1155ContractAddress);
    const erc1155Address = "0x" + bigIntAddress.toString(16);
    const findErc1155 = await smartContractModel.findUnique({
      where: { address: erc1155Address },
    });

    if (!findErc1155) {
      return {
        error: "ERC1155 contract not found.",
        erc1155ContractAddress,
        erc1155Address,
      };
    }

    const ticketTransaction = await smartContractInteractionModel.findFirst({
      where: {
        smartContractId: findErc1155.id,
        method: "get_ticket",
        developerUserId: userId,
      },
    });
    if (!ticketTransaction) {
      return { error: "You don't have a ticket to enter." };
    }
    //@ts-ignore
    const tokenId = ticketTransaction.output?.targetEventValues?.token_id;

    const ticketContract = connectToContract({
      name: "ERC1155EventTicket",
      address: erc1155Address,
    });

    const hasTicket = await interactWithContract(
      "balance_of",
      [account.address, tokenId],
      ticketContract,
    );

    console.log(`Has ticket`, hasTicket);
    if (!hasTicket || !Number(hasTicket)) {
      return { error: "You don't have a ticket to enter." };
    }

    const calls = getGaslessTransactionCallData({
      method: "entry",
      contractAddress,
      body: {
        tokenId,
      },
      abiFunctions: entranceContract.abi,
    });

    const resultTxHash = await gaslessTransaction(account, calls);

    if (resultTxHash.error) {
      const walletInteractionResult = await entranceContract["entry"](tokenId);
      return { gaslessError: resultTxHash.error, walletInteractionResult };
    }
    return {
      txHash: resultTxHash.transactionHash,
      message: "Entered successfully, please scan the NFC.",
      userData: {
        email: accountData.email,
        walletAddress: accountData.walletAddress,
      },
    };
  } catch (e) {
    console.log(e);
    return { error: e?.message || "Unknown error" };
  }
}
