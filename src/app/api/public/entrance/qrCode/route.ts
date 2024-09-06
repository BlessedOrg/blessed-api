import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { smartContractModel } from "@/prisma/models";
import { generateQrCode } from "@/services/generateQrCode";

export const dynamic = "force-dynamic";

async function handler(req: NextRequestWithDevAuth) {
  const { developerId } = req;
  const contractData = await smartContractModel.findFirst({
    where: { developerId, name: "EntranceChecker" },
  });

  if (!contractData?.address) {
    return NextResponse.json(
      { error: `EntranceChecker contract not found for dev: ${developerId}` },
      {
        status: StatusCodes.NOT_FOUND,
      },
    );
  }

  const qrCode = await generateQrCode(
    `${req.nextUrl.origin}/entrance?contractAddress=${contractData.address}`,
  );
  return NextResponse.json(
    { qrCode },
    {
      status: StatusCodes.OK,
    },
  );
}

export const GET = withDeveloperAccessToken(handler);
