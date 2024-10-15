import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractInteractionModel, smartContractModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppParam } from "@/app/middleware/withAppParam";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppParam) {
  const { appId } = req;

  const smartContracts = await smartContractModel.findMany({
    where: {
      appId
    },
    select: {
      id: true
    }
  });

  const smartContractsInteractions = await smartContractInteractionModel.findMany({
    where: {
      smartContractId: {
        in: smartContracts.map(contract => contract.id)
      }
    }
  });
  return NextResponse.json(smartContractsInteractions, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(withAppParam(getHandler));
