import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { withDevAccessToken } from "@/app/middleware/withDevAccessToken";
import { apiTokenModel } from "@/models";
import { createVaultApiKeyItem } from "@/lib/1pwd-vault";
import { withAppValidate } from "@/app/middleware/withAppValidate";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequestWithDevAccessToken & NextRequestWithAppValidate) {
  const { appId, appSlug } = req;
  try {
    const apiTokenRecord = await apiTokenModel.create({
      data: {
        App: {
          connect: { id: appId }
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

    await apiTokenModel.updateMany({
      where: {
        appId,
        id: {
          not: apiTokenRecord?.id
        }
      },
      data: {
        revoked: true
      }
    });
    return NextResponse.json(
      {
        apiKey: vaultItem?.fields?.find(f => f.id === "apiKey")?.value,
        apiTokenVaultKey: vaultItem?.id,
        id: apiTokenRecord?.id
      },
      { status: StatusCodes.OK }
    );
  } catch (e) {
    return NextResponse.json({ error: e }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export const GET = withDevAccessToken(withAppValidate(getHandler));