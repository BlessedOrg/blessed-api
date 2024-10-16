import { NextMiddleware, NextResponse } from "next/server";

export function factoryMiddleware(middlewares: MiddlewareFactory[]): NextMiddleware {
  return (req, event) => {
    return middlewares.reduceRight(
      (acc: any, middleware) => middleware(() => acc(req, event)),
      () => NextResponse.next()
    )(req, event);
  };
}