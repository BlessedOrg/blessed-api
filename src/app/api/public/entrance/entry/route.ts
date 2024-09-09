import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { entranceEntry } from "@/server/api/entranceChecker/entranceEntry";
import { withDeveloperUserAccessToken } from "@/app/middleware/withDeveloperUserAccessToken";
import { smartContractModel } from "@/prisma/models";

async function handler(req: NextRequestWithDevAuth) {
  const searchParams = req.nextUrl.searchParams;
  const contractAddress = searchParams.get("contractAddress");

  const { email } = await req.json();
  if (!email || !contractAddress) {
    return NextResponse.json(
      { error: "Email and contract address are required." },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const contract = await smartContractModel.findFirst({
    where: {
      address: contractAddress
    }
  });
  if (!contract) {
    return NextResponse.json(
      { error: "Contract not found." },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const response = await entranceEntry(email, contractAddress);
  if (response.error) {
    return NextResponse.json(
      response,
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  return NextResponse.json(
    response,
    { status: StatusCodes.OK }
  );
}

export const POST = withDeveloperUserAccessToken(handler);
