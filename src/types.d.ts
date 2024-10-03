import { NextRequest } from "next/server";

export {};
declare global {
  type VaultItemType = "accessToken" | "capsuleKey";
  type AccountType = "user" | "developer"

  // Requests
  type NextRequestWithDeveloperAccessToken = NextRequest & {
    developerId: string;
    developerWalletAddress: string;
    accessTokenVaultKey: string,
    capsuleTokenVaultKey: string,
  };
  type NextRequestWithUserAccessToken = NextRequest & {
    developerId: string;
    userId: string;
    capsuleTokenVaultKey: string,
  };
}