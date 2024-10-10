import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDevAccessToken } from "@/app/middleware/withDevAccessToken";
import { withApiKey } from "@/app/middleware/withApiKey";

export function withApiKeyOrDevAccessToken(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const getApiKeyMiddleware = withApiKey(handler);
      const apiKeyMiddlewareResponse = await getApiKeyMiddleware(request, context, true);
      if (apiKeyMiddlewareResponse instanceof Request) {
        request = apiKeyMiddlewareResponse;
        return handler(request, context);
      }
      const getDevAccessTokenMiddleware = withDevAccessToken(handler);
      const devAccessTokenMiddlewareResponse = await getDevAccessTokenMiddleware(request, context, true);
      if (devAccessTokenMiddlewareResponse instanceof Request) {
        return handler(request, context);
      }
      return NextResponse.json({ error: "Unauthorized, blessed-api-key or Developer Access Token required!" }, { status: StatusCodes.UNAUTHORIZED });

    } catch (error: any) {
      console.log("🚨 withApiKeyOrDevAccessToken:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}