import { withAuth } from "@/app/middleware/withAuth";
import { contractsInterfaces } from "@/contracts/interfaces";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {cairoInputsFormat} from "@/utils/cairoInputsFormat";


async function handler(req: NextRequestWithAuth) {
  const erc20AllowedFunctions = contractsInterfaces["CustomToken"]?.abi?.find(
      (f) => f.name === "openzeppelin::token::erc20::interface::ERC20ABI",
  ).items;

  const formatInputs = (inputs) => {
    return cairoInputsFormat(inputs)
  }
  return NextResponse.json(
    {
      viewFunctions: erc20AllowedFunctions.filter(a => a.state_mutability === "view").map((f) => ({
        name: f.name,
        inputs: formatInputs(f.inputs)
      })),
      readFunctions: erc20AllowedFunctions.filter(a => a.state_mutability === "external").map((f) => ({
        name: f.name,
        inputs: formatInputs(f.inputs)
      })),
    },
    { status: StatusCodes.OK },
  );
}

export const GET = withAuth(handler);
