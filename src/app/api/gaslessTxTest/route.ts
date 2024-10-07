import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withUserAccessToken } from "@/app/middleware/withUserAccessToken";
import { encodeFunctionData } from "viem";
import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk-viem";
import { activeChain } from "@/lib/viem";
import { gaslessTransaction } from "@/lib/gelato";

async function getHandler(req: NextRequestWithUserAccessToken) {
  const counterContractAddress = "0x5034F97bf9518Aa191678Eb8E9B202f0Cf1aE3f1";
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment"
  });
  const request: CallWithERC2771Request = {
    chainId: BigInt(activeChain.id),
    target: counterContractAddress,
    data: data as any,
    user: req.walletAddress
  };
  const gaslessTxResponse = await gaslessTransaction(request, req.capsuleTokenVaultKey);
  return NextResponse.json({ gaslessTxResponse }, {
    status: StatusCodes.OK
  });
}

export const GET = withUserAccessToken(getHandler);

const counterAbi = [{ "inputs": [], "name": "getCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];