import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { createVaultApiTokenItem } from "@/server/vaultApi";
import { apiTokenModel } from "@/prisma/models";
import { withAuth } from "@/app/middleware/withAuth";
import jwt from "jsonwebtoken";

async function postHandler(req: NextRequestWithAuth) {
  const apiTokenRecord = await apiTokenModel.create({
    data: {
      developerId: req.developerId,
      vaultKey: "_"
    }
  });

  const accessToken = jwt.sign({ id: apiTokenRecord?.id }, process.env.JWT_SECRET);

  const vaultItem = await createVaultApiTokenItem(accessToken, req.userId, false);

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

export const GET = withAuth(postHandler);
