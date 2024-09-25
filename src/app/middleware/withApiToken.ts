import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getVaultItem } from "@/server/api/vault/vaultApi";
import jwt from "jsonwebtoken";
import { apiTokenModel } from "@/prisma/models";
import { isEqual } from "lodash-es";

export function withApiToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const token = request.headers.get("apiToken");
      if (!token) {
        return NextResponse.json({ error: "Unauthorized, API Token required!" }, { status: StatusCodes.UNAUTHORIZED });
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      const apiToken = await apiTokenModel.findUnique({
        where: {
          id: decoded?.id
        }
      });

      const itemFromVault = await getVaultItem(apiToken?.vaultKey, "apiKey");
      
      const actualApiToken = itemFromVault.fields.find(f => f.id === "apiToken").value;

      if (!isEqual(token, actualApiToken)) {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: apiToken.developerId,
        appId: decoded.appId
      });

      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withDeveloperApiToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}
