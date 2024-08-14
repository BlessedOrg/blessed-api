import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { StatusCodes } from "http-status-codes";
import { getContractsFunctions } from "@/contracts/interfaces";

// TODO: update the array of contracts with actual data

async function getHandler() {
  const contracts = [
    {
      "name": "SampleContract",
      "description": "Sample contract to test whole flow",
      "functions": getContractsFunctions("SampleContract"),
      "url": ""
    },
    {
      "name": "ERC1155",
      "description": "Multi-token standard for creating 'tickets on steroids'. Can be limited to whitelisted marketplaces, collect royalties on the secondary market, used for fan rewards & perks, kill bots  and offer endless  advanced functionality beyond traditional ticketing systems.",
      "functions": getContractsFunctions("SampleContract"),
      "url": ""
    },
    {
      "name": "ERC20",
      "functions": getContractsFunctions("SampleContract"),
      "description": "Token standard for creating in-house, event-specific, or in-app currencies. Ideal for community building and native event payments, enhancing user engagement and providing a seamless transaction experience within our ecosystem.",
      "url": ""
    }
  ];
  return NextResponse.json(
    { contracts },
    { status: StatusCodes.OK },
  );
}

export const GET = withApiToken(getHandler);