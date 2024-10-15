import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAppBySlugOrId } from "@/lib/applications/getAppBySlugOrId";

export async function GET(req: NextRequest, { params: { app } }) {
  const appData = await getAppBySlugOrId(app);
  return NextResponse.json(appData, {
    status: StatusCodes.OK
  });
}

