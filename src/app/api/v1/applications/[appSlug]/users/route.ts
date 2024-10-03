import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { getAppIdBySlug } from "@/lib/app";
import { createMissingAccounts } from "@/lib/auth/accounts/createMissingAccounts";
import { appModel, developersUserAccountModel } from "@/models";

async function getHandler(req: NextRequestWithDeveloperAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appSlug query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const app = await getAppIdBySlug(appSlug)
  if (!app) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const users = await developersUserAccountModel.findMany({
    where: {
      Apps: {
        some: {
          appId: app.id
        }
      }
    }
  });
  return NextResponse.json(users, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getHandler);

async function postHandler(req: NextRequestWithDeveloperAccessToken, { params: { appSlug } }) {
  const body = await req.json() as {
    "users": { "email": string }[]
  };
  const appData = await appModel.findUnique({
    where: { slug: appSlug },
    select: { id: true }
  });
  const { users } = body;
  if (!appSlug) {
    return NextResponse.json({ error: "appSlug query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const createdUsers = await createMissingAccounts(users.map(i => i.email), appData.id);
  return NextResponse.json(createdUsers, { status: StatusCodes.OK });
}

export const POST = withDeveloperAccessToken(postHandler);