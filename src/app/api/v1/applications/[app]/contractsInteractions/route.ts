import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractInteractionModel, smartContractModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import { withAppValidate } from "@/app/middleware/withAppValidate";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
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

export const GET = withApiKeyOrDevAccessToken(withAppValidate(getHandler));
