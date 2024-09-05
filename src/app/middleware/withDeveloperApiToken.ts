import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { getVaultItem } from "@/server/api/vault/vaultApi";
import jwt from "jsonwebtoken";
import { apiTokenModel } from "@/prisma/models";
import { isEqual } from "lodash-es";

export function withDeveloperApiToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
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

      console.log("🔮 token: ", token)
      console.log("🔮 actualApiToken: ", actualApiToken)

      console.log("🔮 typeof token: ", typeof token)
      console.log("🔮 typeof actualApiToken: ", typeof actualApiToken)

      console.log("🔮 token: ", token.length)
      console.log("🔮 actualApiToken: ", actualApiToken.length)

      console.log("🔮 token: ", token)
      console.log("🔮 actualApiToken: ", actualApiToken)

      console.log("LODASH: ",isEqual(token, actualApiToken));

      if (!isEqual(token, actualApiToken)) {
        console.log(`💽 what`)
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      console.log(`💽 here`)

      Object.assign(request, {
        developerId: apiToken.developerId,
      });

      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withDeveloperApiToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}