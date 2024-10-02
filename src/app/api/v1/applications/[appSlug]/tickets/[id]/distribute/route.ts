import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { client, contractArtifacts, deployContract, getExplorerUrl, writeContractWithNonceGuard } from "@/viem";
import { smartContractModel } from "@/prisma/models";

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

async function postHandler(req: NextRequestWithDeveloperUserAccessToken & NextRequestWithApiToken, { params: { appSlug, id } }) {
  // 🚧 for now just use http://localhost:3000/api/v1/applications/1/tickets/1/distribute
  try {
    // const smartContract = await smartContractModel.findUnique({
    //   where: {
    //     appSlug,
    //     id,
    //     developerId: req.developerId,
    //     name: "tickets"
    //   }
    // });
    //
    // if (!smartContract) {
    //   return NextResponse.json(
    //     { error: `Wrong parameters. Smart contract tickets from User ${req.userId} not found.` },
    //     { status: StatusCodes.BAD_REQUEST }
    //   );
    // }

    // const contract = "0xbfd7177ff99e1011ab3abd4ffe5f3a24f63ef430"
    const contract = await deployTicket()
    console.log("🔮 contract: ", contract)
    console.log("⛓️ Contract Explorer URL: ", getExplorerUrl(contract.contractAddr))

    const args = [
      [
        ['0xb9449446c82b2f2A184D3bAD2C0faFc5F21eEB73', 1],
        ["0x91EBf8f65905AE435301F72b61037C558EBe4972", 2]
      ]
    ];

    console.log("🐥 args: ", args)

    const result = await writeContractWithNonceGuard(
      contract.contractAddr,
      // contract,
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

