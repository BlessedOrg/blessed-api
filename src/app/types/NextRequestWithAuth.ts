import { NextRequest } from "next/server";

export type NextRequestWithAuth = NextRequest & {
  developerId: string;
  userId: string;
};