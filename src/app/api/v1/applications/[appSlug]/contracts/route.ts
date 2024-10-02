import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel, smartContractModel } from "@/prisma/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

async function getHandler(req: NextRequestWithDeveloperAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const app = await appModel.findUnique({
    where: {
      slug: appSlug
    },
    select: {
      id: true
    }
  });

  if (!app) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const smartContracts = await smartContractModel.findMany({
    where: {
      id: app?.id
    }
  });
  return NextResponse.json(smartContracts, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);
