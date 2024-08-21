import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { Account, constants, RpcProvider } from "starknet";
import { gaslessTransaction } from "@/services/gaslessTransaction";

async function handler(req: NextRequestWithDevAuth) {
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
  const ethAmount = 0.00026460734340459;

  const decimalNumber = Number(ethAmount * 10 ** 18);
  const hexNumber = "0x" + decimalNumber.toString(16);

  console.log(hexNumber);
  const result = await gaslessTransaction(operatorAccount, [
    {
      entrypoint: "transfer",
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      calldata: [
        `0x05f15ba09c25fb33daf38fb2b1dadf2ad64c3da1609afd19dd30e54721a91e84`,
        `${hexNumber}`,
        `0x0`,
      ],
    },
  ]);
  return NextResponse.json(
    { result, hexNumber },
    {
      status: StatusCodes.OK,
    },
  );
}

export const GET = handler;
