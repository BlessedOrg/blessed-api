import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequestWithDeveloperAccessToken) {
  const myContracts = await smartContractModel.findMany({
    where: {
      developerId: req.developerId
    },
    include: {
      App: {
        select: {
          name: true,
          id: true
        }
      }
    }
  });

  return NextResponse.json({ myContracts }, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
