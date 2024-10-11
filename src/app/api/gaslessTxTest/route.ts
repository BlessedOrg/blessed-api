import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { encodeFunctionData, parseAbi } from "viem";
import { getCapsuleSigner } from "@/lib/capsule";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { account, contractArtifacts, readContract, rpcUrl } from "@/lib/viem";
import { ethers } from "ethers";
import { NonceManager } from "@ethersproject/experimental";

async function getHandler(req: NextRequestWithUserAccessToken) {
  // 🏗️ TODO: clean this - WiP
  // const res = await fetch(`https://engine.sketchpad-1.forma.art/relayer/393b72f1-11b4-4d9a-8aa0-2fc19e320501/transaction/status/6914d05f-e199-44c6-b905-742a69096dbc`)
  //
  // const json = await res.json()
  // console.log("🔮 json: ", json)
  //
  // return
  const capsuleSigner = await getCapsuleSigner(req.capsuleTokenVaultKey);

  console.log({ capsuleSignerAddress: capsuleSigner.account.address });

  const contractAddress = "0x2CE1C37d11971C6A95e408DF3bdf78ef9999DE68";
  const abi = contractArtifacts["tickets"].abi;
  const data = encodeFunctionData({
    abi,
    functionName: "count",
    args: [],
  });

  const owner = await readContract(
    contractAddress,
    contractArtifacts["tickets"].abi,
    "owner",
    []
  );
  console.log("🔮 owner: ", owner);

  const provider = new ethers.providers.JsonRpcProvider({
    skipFetchSetup: true,
    fetchOptions: {
      referrer: process.env.NEXT_PUBLIC_BASE_URL!
    },
    url: rpcUrl!
  });

  const signer = provider.getSigner(capsuleSigner.account.address);
  const nonceManager = new NonceManager(signer);
  const nonce = await nonceManager.getTransactionCount("latest");

  const gasEstimate = await provider.estimateGas({
    from: capsuleSigner.account.address,
    to: contractAddress,
    data,
  });

  console.log({gasEstimate, string: gasEstimate.toString()});

  const transaction = {
    chainid: process.env.NEXT_PUBLIC_CHAIN_ID,
    from: capsuleSigner.account.address,
    to: contractAddress,
    value: "0",
    gas: gasEstimate.toString(),
    nonce,
    data,
  };

  const signature = await capsuleSigner.signMessage(JSON.stringify(transaction));

  console.log("🔮 transaction: ", transaction);

  const payload = {
    type: "forward",
    request: transaction,
    signature,
    forwarderAddress: "0x839320b787DbB268dCF0170302b16b25168B6bA7", // TODO: make it some var, maybe env var?
  };

  const response = await fetch("relayer-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const relayerRes = await response.json();
  console.log("🌳 relayerRes: ", relayerRes);
  return NextResponse.json({}, {
    status: StatusCodes.OK,
  });
}

export const GET = withDeveloperAccessToken(getHandler);