import { NextRequest } from "next/server";

export {};
declare global {
  type VaultItemType = "accessToken" | "capsuleKey";
  type AccountType = "user" | "developer"

  // Requests
  type NextRequestWithDeveloperAccessToken = NextRequest & {
    developerId: string;
    walletAddress: string;
    accessTokenVaultKey: string,
    capsuleTokenVaultKey: string,
  };
  type NextRequestWithUserAccessToken = NextRequest & {
    userId: string;
    capsuleTokenVaultKey: string,
    walletAddress: `0x${string}`,
    email: string
  };
}