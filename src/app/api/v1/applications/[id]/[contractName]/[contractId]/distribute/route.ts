import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { client, contractArtifacts, deployContract, getExplorerUrl, writeContractWithNonceGuard } from "@/viem";

const deployTicket = async () => {
  const owner = client.account.address;
  const baseURI = 'https://api.example.com/metadata/';
  const name = 'Free Ticket';
  const symbol = 'FTK';
  const initialSupply = 100;
  const maxSupply = 10000;
  const transferable = true;
  const whitelistOnly = false;

  const args = [
    owner,
    baseURI,
    name,
    symbol,
    initialSupply,
    maxSupply,
    transferable,
    whitelistOnly
  ];
  return deployContract("tickets", args);
}

async function postHandler(req: NextRequestWithDeveloperUserAccessToken & NextRequestWithApiToken) {
  // 🚧 for now just use http://localhost:3000/api/v1/applications/1/tickets/1/distribute
  try {
    const contract = await deployTicket()
    console.log("⛓️ Contract Explorer URL: ", getExplorerUrl(contract.contractAddr))

    const args = [
      [
        ['0xb9449446c82b2f2A184D3bAD2C0faFc5F21eEB73', 1],
        ["0x91EBf8f65905AE435301F72b61037C558EBe4972", 2]
      ]
    ];

    const result = await writeContractWithNonceGuard(
      contract.contractAddr,
      "distribute",
      args,
      contractArtifacts["tickets"].abi,
      req.userId
    );

    return NextResponse.json(
      {
        success: true,
        contract,
        distributionBlockHash: result.blockHash,
        explorerUrls: {
          contract: getExplorerUrl(contract.contractAddr),
          distributionTx: getExplorerUrl(result.transactionHash)
        }
      },
      { status: StatusCodes.OK }
    );
  } catch(error) {
    console.log("🔮 error: ", error.message)
    return NextResponse.json(
      { error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
export const maxDuration = 300;
export const POST = postHandler;

