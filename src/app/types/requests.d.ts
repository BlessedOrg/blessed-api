import { NextRequest } from "next/server";

declare global {
     type NextRequestWithAuth = NextRequest & {
        developerId: string;
        userId: string;
    };

    type NextRequestWithDevAuth = NextRequest & {
        developerId: string;
        developerWalletAddress: string;
        isDevAccountDeployed: boolean;
    };
}

export {}