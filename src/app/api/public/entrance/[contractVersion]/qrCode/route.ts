import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { smartContractModel } from "@/prisma/models";
import { generateQrCode } from "@/utils/generateQrCode";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";

export const dynamic = "force-dynamic";

async function handler(req: NextRequestWithApiTokenAuth, { params: { contractVersion } }) {
  const { developerId } = req;
  console.log(`contractVersion:`, +contractVersion);
  const contractData = await smartContractModel.findFirst({
    where: { developerId, name: "EntranceChecker", version: +contractVersion }
  });

  if (!contractData?.address) {
    return NextResponse.json(
      { error: `EntranceChecker contract not found for dev: ${developerId}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const qrCode = await generateQrCode(`${req.nextUrl.origin}/entrance?contractAddress=${contractData.address}`);
  return NextResponse.json(
    { qrCode },
    { status: StatusCodes.OK }
  );
}

export const GET = withDeveloperApiToken(handler);
