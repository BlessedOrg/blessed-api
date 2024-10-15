import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { withCors } from "@/app/middleware/withCors";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1/")) {
    return withCors(() => NextResponse.next())(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*"
};
