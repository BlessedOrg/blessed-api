import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { Account, constants, RpcProvider } from "starknet";
import { withDevAuth } from "@/app/middleware/withDevAuth";
import { erc20TokenModel } from "@/prisma/models";
import deployContract from "@/services/deployContract";

async function handler(req: NextRequestWithDevAuth) {
  const body = await req.json();
  const { name, symbol, supplyAmount } = body;
  const provider = new RpcProvider({
    nodeUrl: constants.NetworkName.SN_SEPOLIA,
  });

  if (!name || !symbol || !supplyAmount) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  //Operator account
  const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY!;
  const operatorPublicKey = process.env.OPERATOR_WALLET_ADDR!;
  if (!operatorPrivateKey || !operatorPublicKey) {
    throw new Error("Missing operator environment variables");
  }
  const operatorAccount = new Account(
    provider,
    operatorPublicKey,
    operatorPrivateKey,
  );

  const contractClassHash =
    "0x05eecb88cfbe969745a1e1e886010bcd4177164e5e131f71b69176ca6960eda0";

  const supply = BigInt(supplyAmount) * BigInt(10 ** 18);

  const ownerAddress = req.developerWalletAddress;

  try {
    const deployResponse = await deployContract({
      classHash: contractClassHash,
      contractName: "CustomToken",
      constructorArgs: {
        owner: ownerAddress,
        name,
        symbol,
        supply,
      },
    });
    const { status } = deployResponse;
    if (status === "success") {
      const createdErc20Record = await erc20TokenModel.create({
        data: {
          developerId: req.developerId,
          contractAddress: deployResponse.contract_address,
          name,
          symbol,
          supply: Number(supplyAmount),
          decimals: 18,
        },
      });

      return NextResponse.json(
        {
          contractAddress: deployResponse.contract_address,
          status,
          createdErc20Record,
        },
        {
          status: StatusCodes.OK,
        },
      );
    }
  } catch (e) {
    const error = e.message as any;
    return NextResponse.json(
      { error },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export const POST = withDevAuth(handler);
