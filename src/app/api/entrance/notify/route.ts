import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sendEntranceNotificationToHost } from "@/server/api/entranceChecker/sendEntranceNotificationToHost";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contractAddress, isLocalhost, userData } = body;
  const response = await sendEntranceNotificationToHost({ contractAddress, isLocalhost, userData });

  return NextResponse.json(
    { response },
    {
      status: StatusCodes.OK,
    }
  );
}
