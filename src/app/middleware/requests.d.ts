import { NextRequest } from "next/server";

declare global {
  type NextRequestWithApiToken = NextRequest & {
    developerId: string;
    appId: string;
    userId: string;
  };

  type NextRequestWithDeveloperAccessToken = NextRequest & {
    developerId: string;
    developerWalletAddress: string;
    isDevAccountDeployed: boolean;
  };

  type NextRequestWithDeveloperUserAccessToken = NextRequest & {
    developerId: string;
    userId: string;
  };
}

export {}
