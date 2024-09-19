import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { createVaultApiTokenItem } from "@/server/api/vault/vaultApi";
import { apiTokenModel } from "@/prisma/models";
import jwt from "jsonwebtoken";
import z from "zod";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";

export const dynamic = "force-dynamic";

async function postHandler(req: NextRequestWithApiTokenAuth) {
  const parsedParams = z.string().safeParse(req.nextUrl.searchParams.get("appId"));
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "appId is required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const apiTokenRecord = await apiTokenModel.create({
    data: {
      developerId: req.developerId,
      vaultKey: "_",
      appId: parsedParams.data
    }
  });

  const accessToken = jwt.sign({ id: apiTokenRecord?.id, appId: parsedParams.data }, process.env.JWT_SECRET);

  const vaultItem = await createVaultApiTokenItem(accessToken, req.userId);

  await apiTokenModel.update({
    where: {
      id: apiTokenRecord?.id
    },
    data: {
      vaultKey: vaultItem?.id as string
    }
  });

  return NextResponse.json(
    {
      apiToken: vaultItem?.fields?.find(f => f.id === "apiToken")?.value,
      vaultKey: vaultItem?.id
    },
    { status: StatusCodes.OK },
  );
}

export const GET = withDeveloperAccessToken(postHandler);
