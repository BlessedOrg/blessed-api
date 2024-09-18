import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { entranceEntry } from "@/server/api/entranceChecker/entranceEntry";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { enteredEmail, contractAddress } = body;
  const res = await entranceEntry(enteredEmail, contractAddress);

  return NextResponse.json(res, {
    status: StatusCodes.OK,
  });
}
