import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { withDevAccessToken } from "@/app/middleware/withDevAccessToken";
import { apiTokenModel } from "@/models";
import { createVaultApiKeyItem } from "@/lib/1pwd-vault";

export const dynamic = "force-dynamic";

async function postHandler(req: NextRequestWithDevAccessToken, { params: { appSlug } }) {
  if (!appSlug) {
    return NextResponse.json({ error: "appId query param is required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const apiTokenRecord = await apiTokenModel.create({
    data: {
      App: {
        connect: {
          slug: appSlug
        }
      },
      apiTokenVaultKey: ""
    }
  });

  const apiKey = jwt.sign({ appSlug: appSlug, apiTokenId: apiTokenRecord?.id, developerId: req.developerId }, process.env.JWT_SECRET);

  const vaultItem = await createVaultApiKeyItem(apiKey, appSlug);

  await apiTokenModel.update({
    where: {
      id: apiTokenRecord?.id
    },
    data: {
      apiTokenVaultKey: vaultItem?.id as string
    }
  });

  return NextResponse.json(
    {
      apiKey: vaultItem?.fields?.find(f => f.id === "apiKey")?.value,
      apiTokenVaultKey: vaultItem?.id
    },
    { status: StatusCodes.OK }
  );
}

export const POST = withDevAccessToken(postHandler);