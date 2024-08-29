import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { StatusCodes } from "http-status-codes";
import {contractsInterfaces, getContractsFunctions, getReadableContractsFunctions} from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";

// TODO: update the array of contracts with actual data

async function getHandler(req: NextRequestWithAuth) {
  // TODO: decide if we want to get files automatically from artifacts folder, but loose description and url, or do it manually
  // let contractsFromFiles: any[] = [];
  // for (const obj of [contractsInterfaces]) {
  //   for (const [key, value] of Object.entries(obj)) {
  //     contractsFromFiles.push({
  //       name: key,
  //       functions: getContractsFunctions(key),
  //       artifacts: value
  //     })
  //   }
  // }
  // console.log("🔥 contractsFromFiles: ", contractsFromFiles)

  const myContracts = await smartContractModel.findMany({
    where: {
      developerId: req.developerId
    }
  });

  const availableContracts = [
    {
      "name": "SampleContract",
      "description": "Sample contract to test whole flow",
      "functions": getReadableContractsFunctions("SampleContract"),
      "url": ""
    },
    {
      "name": "ERC1155",
      "description": "Multi-token standard for creating 'tickets on steroids'. Can be limited to whitelisted marketplaces, collect royalties on the secondary market, used for fan rewards & perks, kill bots  and offer endless  advanced functionality beyond traditional ticketing systems.",
      "functions": getReadableContractsFunctions("SampleContract"),
      "url": ""
    },
    {
      "name": "ERC20",
      "functions": getReadableContractsFunctions("SampleContract"),
      "description": "Token standard for creating in-house, event-specific, or in-app currencies. Ideal for community building and native event payments, enhancing user engagement and providing a seamless transaction experience within our ecosystem.",
      "url": ""
    }
  ];
  return NextResponse.json(
    { availableContracts, myContracts },
    { status: StatusCodes.OK },
  );
}

export const GET = withApiToken(getHandler);