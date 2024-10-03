import { developerAccountModel } from "@/models";
import { createOrUpdateSession } from "@/lib/auth/session";
import { StatusCodes } from "http-status-codes";
import { createCapsuleAccount } from "@/lib/auth/accounts/createCapsuleAccount";

export const createDeveloperAccount = async (email: string) => {
  try {
    const { data, error, status } = await createCapsuleAccount(email, "developer");
    if (!!error) {
      return { error, status };
    }
    const { capsuleTokenVaultKey, walletAddress } = data;
    const createdDeveloperAccount: any = await developerAccountModel.create({
      data: {
        email,
        walletAddress,
        capsuleTokenVaultKey
      }
    });

    if (createdDeveloperAccount) {
      const { accessToken, refreshToken } = await createOrUpdateSession(email, "developer");

      const data = {
        accessToken,
        refreshToken,
        developer: {
          email,
          walletAddress,
          id: createdDeveloperAccount.id
        },
        message: "Account created successfully"
      };
      return { data, status: StatusCodes.CREATED };
    } else {
      return {
        error: "Failed to create account",
        status: StatusCodes.INTERNAL_SERVER_ERROR
      };
    }
  } catch (e) {
    return {
      error: e,
      status: StatusCodes.INTERNAL_SERVER_ERROR
    };
  }
};