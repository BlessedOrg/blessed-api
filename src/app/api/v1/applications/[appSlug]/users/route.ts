import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getAppIdBySlug } from "@/lib/queries";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { appModel, userModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appSlug query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }
  const app = await getAppIdBySlug(appSlug);
  if (!app) {
    return NextResponse.json(
      { error: `App not found` },
      { status: StatusCodes.NOT_FOUND }
    );
  }

  const users = await userModel.findMany({
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

export const GET = withApiKeyOrDevAccessToken(getHandler);

async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken, { params: { appSlug } }) {
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

export const POST = withApiKeyOrDevAccessToken(postHandler);