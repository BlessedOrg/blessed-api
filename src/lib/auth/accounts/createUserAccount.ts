import { appUserModel, userModel } from "@/models";
import { createOrUpdateSession } from "@/lib/auth/session";
import { StatusCodes } from "http-status-codes";
import { createCapsuleAccount } from "@/lib/auth/accounts/createCapsuleAccount";

export const createUserAccount = async (email: string, appId: string) => {
  try {
    const createdUserAccount: any = await userModel.create({
      data: {
        email
      }
    });
    const { data, error, status } = await createCapsuleAccount(createdUserAccount.id, email, "user");
    if (!!error) {
      return { error, status };
    }
    const { capsuleTokenVaultKey, walletAddress } = data;

    await userModel.update({
      where: { id: createdUserAccount.id },
      data: {
        walletAddress,
        capsuleTokenVaultKey
      }
    });
    await appUserModel.create({
      data: {
        userId: createdUserAccount.id,
        appId
      }
    });

    if (createdUserAccount) {
      const { accessToken, refreshToken } = await createOrUpdateSession(email, "user");

      const data = {
        accessToken,
        refreshToken,
        user: {
          email,
          walletAddress,
          id: createdUserAccount.id
        },
        message: "User account created successfully"
      };
      return { data, status: StatusCodes.CREATED };
    } else {
      return {
        error: "Failed to create user account",
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