import { NextResponse } from "next/server";

const allowedOrigins = [
  // "http://localhost:3002",
  // "http://localhost:3001",
  // "https://blessed.fan",
  // "https://dashboard.blessed.fan",
];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400"
};

export const withCors: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const origin = request.headers.get("origin") ?? "*";
    // const isAllowedOrigin = allowedOrigins.includes(origin);
    const isAllowedOrigin = true;
    if (request.method === "OPTIONS") {
      const preflightHeaders = {
        ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
        ...corsOptions
      };
      return NextResponse.json({}, { headers: preflightHeaders });
    }
    const response = await next(request, event);

    if (!response) {
      const newResponse = NextResponse.next();
      if (isAllowedOrigin) {
        newResponse.headers.set("Vary", "Origin");
        newResponse.headers.set("Access-Control-Allow-Origin", origin);
        Object.entries(corsOptions).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
      }
      return newResponse;
    }

    if (isAllowedOrigin) {
      response.headers.set("Vary", "Origin");
      response.headers.set("Access-Control-Allow-Origin", origin);
      Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
};