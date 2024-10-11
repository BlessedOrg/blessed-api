import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKey } from "@/app/middleware/withApiKey";
import { withUserAccessToken } from "@/app/middleware/withUserAccessToken";

export function withApiKeyAndUserAccessToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const getApiKeyMiddleware = withApiKey(handler);
      const apiKeyMiddlewareResponse = await getApiKeyMiddleware(request, context, true);
      if (apiKeyMiddlewareResponse instanceof Request) {
        request = apiKeyMiddlewareResponse;
      }
      const getUserAccessTokenMiddleware = withUserAccessToken(handler);
      const userAccessTokenMiddlewareResponse = await getUserAccessTokenMiddleware(request, context, true);

      if (userAccessTokenMiddlewareResponse instanceof Request) {
        request = userAccessTokenMiddlewareResponse;
      }
      if (userAccessTokenMiddlewareResponse instanceof Response || apiKeyMiddlewareResponse instanceof Response) {
        return NextResponse.json({ error: "Unauthorized, blessed-api-key and User Access Token required!" }, { status: StatusCodes.UNAUTHORIZED });
      }

      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withApiKeyAndUserAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}