import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { userSessionModel } from "@/models";

export function withUserAccessToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const session: any = await userSessionModel.findFirst({
        where: {
          accessToken: token
        },
        orderBy: {
          updatedAt: "desc"
        }
      });

      if (token !== session?.accessToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: session.developerId,
        userId: session.developerUserId,
        capsuleTokenVaultKey: decoded.capsuleTokenVaultKey
      });

      return handler(request, context);
    } catch (error) {
      console.log("🚨 withUserAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}
