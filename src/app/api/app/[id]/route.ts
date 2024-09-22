import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { appModel } from "@/prisma/models";

export async function GET(req: NextRequestWithDevAuth, { params: { id } }) {
  if (!id) {
    return NextResponse.json({ error: "appId is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const app = await appModel.findUnique({
    where: {
      id
    }
  });

  if (!app) {
    return NextResponse.json({ error: `App not found` }, { status: StatusCodes.NOT_FOUND });
  }
  return NextResponse.json(app, { status: StatusCodes.OK });
}
