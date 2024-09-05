import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getIrysUploader } from "@/services/irys";

async function getHandler(req: NextRequestWithAuth) {


  const skrt = await getIrysUploader()


  return NextResponse.json(
    { result: "test" },
    { status: StatusCodes.OK }
  );
}

export const GET = getHandler;
