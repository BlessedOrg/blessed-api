import { NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { StatusCodes } from "http-status-codes";

// TODO: update the array of contracts with actual data
const contracts = [
  {
    "name": "ERC1155",
    "description": "Multi-token standard for creating 'tickets on steroids'. Can be limited to whitelisted marketplaces, collect royalties on the secondary market, used for fan rewards & perks, kill bots  and offer endless  advanced functionality beyond traditional ticketing systems.",
    "url": ""
  },
  {
    "name": "ERC20",
    "description": "Token standard for creating in-house, event-specific, or in-app currencies. Ideal for community building and native event payments, enhancing user engagement and providing a seamless transaction experience within our ecosystem.",
    "url": ""
  }
];

async function getHandler() {
  return NextResponse.json(
    { contracts },
    { status: StatusCodes.OK },
  );
}

export const GET = withAuth(getHandler);