import { NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { StatusCodes } from "http-status-codes";

// TODO: update the array of contracts with actual data
const contracts = [
  {
    "name": "ERC1155",
    "description": "",
    "url": ""
  },
  {
    "name": "ERC20",
    "description": "",
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