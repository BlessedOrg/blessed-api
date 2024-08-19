import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getVaultApiTokenItem } from "@/server/vaultApi";
import jwt from "jsonwebtoken";
import { apiTokenModel } from "@/prisma/models";

export function withApiToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
      }

      const token = authHeader.split(" ")[1];

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      const apiToken = await apiTokenModel.findUnique({
        where: {
          id: decoded?.id
        }
      });

      const itemFromVault = await getVaultApiTokenItem(apiToken?.vaultKey);

      const actualApiToken = itemFromVault.fields.find(f => f.id === "apiToken").value;

      if (token !== actualApiToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: apiToken.developerId,
        userId: itemFromVault?.fields?.find(f => f.id === "userId")?.value
      });

      return handler(request, context);
    } catch (error: any) {
      return NextResponse.json({ error: `Invalid token. Reason: ${error.message}` }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}