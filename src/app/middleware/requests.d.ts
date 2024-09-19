import { NextRequest } from "next/server";

declare global {
  type NextRequestWithApiTokenAuth = NextRequest & {
    developerId: string;
    appId: string;
  };

  type NextRequestWithDevAuth = NextRequest & {
    developerId: string;
    developerWalletAddress: string;
    isDevAccountDeployed: boolean;
  };

  type NextRequestWithDevUserAuth = NextRequest & {
    developerId: string;
    userId: string;
  };
}

export {}
