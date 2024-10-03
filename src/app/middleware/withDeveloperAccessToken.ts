import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sessionModel } from "@/prisma/models";

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

      const session = await sessionModel.findFirst({
        where: {
          accessToken: token,
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          DeveloperAccount: true,
        },
      });

      console.log("🔮 session: ", session)

      if (!session?.developerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
      }
      if (token !== session.accessToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: StatusCodes.UNAUTHORIZED });
      }

      Object.assign(request, {
        developerId: session.developerId,
        developerWalletAddress: session.DeveloperAccount.walletAddress,
      });

      return handler(request, context);
    } catch (error) {
      console.log("🚨 withDeveloperAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}
