import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import { getAppBySlugOrId } from "@/lib/applications/getAppBySlugOrId";

export function withAppValidate(handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context) => {
    try {
      const appIdentifier = request.nextUrl.pathname.split("/")[4]; // Index 4 for 'applications/:appId'
      if (!appIdentifier) {
        return NextResponse.json({ error: "APP Identifier query param is required" }, { status: StatusCodes.BAD_REQUEST });
      }
      const app = await getAppBySlugOrId(appIdentifier);
      if (!app) {
        return NextResponse.json({ error: "Application not found" }, { status: StatusCodes.NOT_FOUND });
      }
      Object.assign(request, {
        appId: app.id,
        appOwnerId: app.developerId,
        appOwnerWalletAddress: app.DeveloperAccount.walletAddress,
        appSlug: app.slug,
        appName: app.name,
        appImageUrl: app?.imageUrl
      });

      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withAppValidate:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}