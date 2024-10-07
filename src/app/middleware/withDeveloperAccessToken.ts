import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { getVaultItem } from "@/lib/1pwd-vault";
import { developerSessionModel } from "@/models";

export function withDeveloperAccessToken(
  handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Bearer token not provided" }, { status: StatusCodes.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const session = await developerSessionModel.findFirst({
        where: {
          developerId: decoded.id
        },
        orderBy: {
          updatedAt: "desc"
        }
      });
      if (new Date(session.expiresAt).getTime() < new Date().getTime()) {
        return NextResponse.json({ error: "Session expired" }, { status: StatusCodes.UNAUTHORIZED });
      }
      const itemFromVault = await getVaultItem(decoded?.accessTokenVaultKey, "accessToken");

      if (!itemFromVault?.fields?.some(i => i.value === token) && itemFromVault.fields?.find(i => i.id === "accessToken").value === "none") {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: decoded.id,
        walletAddress: decoded.walletAddress,
        accessTokenVaultKey: decoded.accessTokenVaultKey,
        capsuleTokenVaultKey: decoded.capsuleTokenVaultKey
      });

      return handler(request, context);
    } catch (error) {
      console.log("🚨 withDeveloperAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}
