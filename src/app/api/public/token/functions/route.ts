import { withAuth } from "@/app/middleware/withAuth";
import { contractsInterfaces } from "@/contracts/interfaces";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {cairoInputsFormat} from "@/utils/cairoInputsFormat";

async function handler(req: NextRequestWithAuth) {
  const erc20AllowedFunctions = contractsInterfaces["CustomToken"]?.abi?.filter(i => i.type === "interface").flatMap(i => i.items)

  const formatInputs = (inputs) => {
    return cairoInputsFormat(inputs)
  }
  return NextResponse.json(
    {
      viewFunctions: erc20AllowedFunctions.filter(a => a.state_mutability === "view").map((f) => ({
        name: f.name,
        inputs: formatInputs(f.inputs)
      })),
      writeFunctions: erc20AllowedFunctions.filter(a => a.state_mutability === "external").map((f) => ({
        name: f.name,
        inputs: formatInputs(f.inputs)
      })),
    },
    { status: StatusCodes.OK },
  );
}

export const GET = withAuth(handler);
