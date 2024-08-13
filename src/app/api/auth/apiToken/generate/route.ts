import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/middleware/auth";
import { StatusCodes } from "http-status-codes";
import { createVaultApiTokenItem } from "@/server/vaultApi";
import { apiTokenModel } from "@/prisma/models";

async function postHandler(req: NextRequest) {
  // 🚨 TODO: use real userId
  const userId = "clzre71d200006p8wgqt0wmph";

  const vaultItem = await createVaultApiTokenItem(userId, false);

  await apiTokenModel.create({
    data: {
      developerId: userId,
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
