import { NextMiddleware, NextRequest } from "next/server";

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

  type AppValidate = {
    appId: string
    appSlug: string
    appName: string
    appImageUrl: string
    appOwnerId: string
    appOwnerWalletAddress: string
  }

  type TicketValidate = {
    ticketId: string;
    ticketContractAddress: string
  }

  // Requests
  type NextRequestWithTicketValidate = NextRequest & TicketValidate;
  type NextRequestWithAppValidate = NextRequest & AppValidate;
  type NextRequestWithDevAccessToken = NextRequest & DeveloperAccessTokenJWT;
  type NextRequestWithUserAccessToken = NextRequest & UserAccessTokenJWT
  type NextRequestWithApiKey = NextRequest & ApiTokenJWT
  type NextRequestWithApiKeyOrDevAccessToken = NextRequest & NextRequestWithApiKey | NextRequestWithDevAccessToken;
  type NextRequestWithApiKeyAndUserAccessToken = NextRequest & NextRequestWithApiKey & NextRequestWithUserAccessToken;
  type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;
}