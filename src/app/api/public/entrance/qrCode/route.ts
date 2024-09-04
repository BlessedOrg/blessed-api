import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDevAuth } from "@/app/middleware/withDevAuth";
import { smartContractModel } from "@/prisma/models";
import { generateQrCode } from "@/services/generateQrCode";

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
    `${process.env.NEXT_PUBLIC_BASE_URL}/entrance?contractAddress=${contractData.address}`,
  );
  return NextResponse.json(
    { qrCode },
    {
      status: StatusCodes.OK,
    },
  );
}

export const GET = withDevAuth(handler);
