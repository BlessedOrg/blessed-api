import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sessionModel } from "@/models";

export function withDeveloperUserAccessToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
      }
      const token = authHeader.split(" ")[1];

      const session: any = await sessionModel.findFirst({
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
        userId: session.developerUserId
      });

      return handler(request, context);
    } catch (error) {
      console.log("🚨 withDeveloperUserAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}
