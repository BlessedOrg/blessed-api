import { getVaultItem } from "@/lib/1pwd-vault";
import { apiTokenModel } from "@/models";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { isEqual } from "lodash-es";
import { NextRequest, NextResponse } from "next/server";

export function withApiKey(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }, globalMiddlewareResponse?: boolean) => {
    try {
      const token = request.headers.get("blessed-api-key");
      if (!token) {
        return NextResponse.json({ error: "Unauthorized, blessed-api-key required!" }, { status: StatusCodes.UNAUTHORIZED });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as ApiTokenJWT;

      const apiToken = await apiTokenModel.findUnique({
        where: {
          id: decoded?.apiTokenId
        },
        include: {
          App: {
            include: {
              DeveloperAccount: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      });

      const itemFromVault = await getVaultItem(apiToken?.apiTokenVaultKey, "apiKey");

      const actualApiToken = itemFromVault.fields.find(f => f.id === "apiKey").value;

      if (!isEqual(token, actualApiToken)) {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: apiToken.App.DeveloperAccount.id,
        appSlug: decoded?.appSlug
      });

      if (globalMiddlewareResponse) {
        return request;
      }
      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withDeveloperApiToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}