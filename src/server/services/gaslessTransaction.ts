import { Abi, Account, Call } from "starknet";
import { toBeHex } from "ethers";
import { fetchBuildTypedData, fetchExecuteTransaction, SEPOLIA_BASE_URL } from "@avnu/gasless-sdk";
import { isEmpty } from "lodash-es";
import { bigIntToHex } from "@/utils/numberConverts";
import { flattenArray } from "@/utils/flattenArray";

/**
 * @param account - Account
 * @param calls - Calls[] - e.g.
 * ```typescript
 * [
 *     {
 *         entrypoint: "approve",
 *         contractAddress:
 *             "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH
 *         calldata: [
 *             "0x03dc2f3741106ec05307963159bfcff41e661722bc9349f9dc565f2540df9561", // spender
 *             "0x0", // 0
 *             "0x0" // 0
 *         ],
 *     },
 * ]
 * ```
 * * @returns {Promise<{transactionHash?: string, error?:any}>}
 *  */
export async function gaslessTransaction(
  account: Account,
  calls: Call[],
): Promise<{ transactionHash?: string; error?: any }> {
  try {
    console.log(`🔮 Gasless transaction for ${account.address}`);
    console.log("🔥 account.address: ", account.address)
    console.log("🔮 calls: ", calls)
    const typedData = await fetchBuildTypedData(
      account.address,
      calls,
      undefined,
      undefined,
      {
        apiKey: process.env.ANVU_API_KEY,
        baseUrl: SEPOLIA_BASE_URL,
      },
    );

    console.log("🔮 typedData: ", typedData)

    let signature = await account.signMessage(typedData);

    if (Array.isArray(signature)) {
      signature = signature.map((sig) => toBeHex(BigInt(sig)));
    } else if (signature.r && signature.s) {
      signature = [toBeHex(BigInt(signature.r)), toBeHex(BigInt(signature.s))];
    }

    const executeData = await fetchExecuteTransaction(
      account.address,
      JSON.stringify(typedData),
      signature,
      {
        apiKey: process.env.ANVU_API_KEY!,
        baseUrl: SEPOLIA_BASE_URL,
      },
    );

    return { transactionHash: executeData.transactionHash };
  } catch (error) {
    console.error("🚨 gaslessTransaction error:", error.message);
    return { error: error?.message || "Unknown error" };
  }
}

interface GetGaslessTransactionCallDataArgs {
  method: string;
  contractAddress: string;
  body: { [key: string]: any };
  abiFunctions: any[] | Abi;
}

export const getGaslessTransactionCallData = ({
  method,
  contractAddress,
  body,
  abiFunctions,
}: GetGaslessTransactionCallDataArgs) => {
  const inputs = abiFunctions.find((m) => m.name === method).inputs;
  if (isEmpty(inputs)) {
    return [
      {
        entrypoint: method,
        contractAddress,
        calldata: [],
      },
    ];
  } else {
    const formattedInputs = inputs.map((input) => {
      // 🏗️ TODO: must be more sophisticated
      if (input.type.includes("integer::u256")) {
        if (input.name.toLowerCase().includes("id")) {
          return [bigIntToHex(BigInt(body[input.name])), "0x0"];
        }
        return [bigIntToHex(body[input.name]), "0x0"];
      }
      if (input.type.includes("core::bool")) {
        return !!body[input.name]
      }
      return body[input.name];
    });
    const calldata = flattenArray(formattedInputs);
    return [
      {
        entrypoint: method,
        contractAddress,
        calldata,
      },
    ];
  }
};
