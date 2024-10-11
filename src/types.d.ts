import { NextRequest } from "next/server";

export {};
declare global {
  type VaultItemType = "accessToken" | "capsuleKey" | "apiKey";
  type AccountType = "user" | "developer"

  //jwt's payload
  type ApiTokenJWT = {
    appSlug: string;
    apiTokenId: string;
    developerId: string;
  }
  type UserAccessTokenJWT = {
    userId: string;
    capsuleTokenVaultKey: string,
    walletAddress: `0x${string}`,
    email: string
  }
  type DeveloperAccessTokenJWT = {
    developerId: string;
    walletAddress: string;
    accessTokenVaultKey: string,
    capsuleTokenVaultKey: string,
  }

  // Requests
  type NextRequestWithDevAccessToken = NextRequest & DeveloperAccessTokenJWT;
  type NextRequestWithUserAccessToken = NextRequest & UserAccessTokenJWT
  type NextRequestWithApiKey = NextRequest & ApiTokenJWT
  type NextRequestWithApiKeyOrDevAccessToken = NextRequest & NextRequestWithApiKey | NextRequestWithDevAccessToken;
  type NextRequestWithApiKeyAndUserAccessToken = NextRequest & NextRequestWithApiKey & NextRequestWithUserAccessToken;
}