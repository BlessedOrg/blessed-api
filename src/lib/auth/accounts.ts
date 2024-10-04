import { appUserModel, developerAccountModel, prisma, userModel } from "@/models";
import { createOrUpdateSession } from "@/lib/auth/session";
import { StatusCodes } from "http-status-codes";
import { createCapsuleAccount } from "@/lib/capsule";

export const createDeveloperAccount = async (email: string) => {
  try {
    const createdDeveloperAccount: any = await developerAccountModel.create({
      data: {
        email
      }
    });
    const { data, error, status } = await createCapsuleAccount(createdDeveloperAccount.id, email, "developer");
    if (!!error) {
      return { error, status };
    }
    const { capsuleTokenVaultKey, walletAddress } = data;

    await developerAccountModel.update({
      where: { id: createdDeveloperAccount.id },
      data: {
        capsuleTokenVaultKey,
        walletAddress
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

export const createMissingAccounts = async (emails: string[], appId: string)=> {
  try {
    const existingAccounts = await userModel.findMany({
      where: {
        email: {
          in: emails
        }
      },
      include: {
        Apps: {
          where: {
            appId: appId
          }
        }
      }
    });

    const accountsToAssign = existingAccounts.filter(account => account.Apps.length === 0);
    const alreadyAssignedAccounts = existingAccounts.filter(account => account.Apps.length > 0);
    const nonExistingEmails = emails.filter(email => !existingAccounts.some(account => account.email === email));

    const result = await prisma.$transaction(async (tx) => {
      const assignExistingAccounts = await tx.appUser.createMany({
        data: accountsToAssign.map(account => ({
          appId: appId,
          userId: account.id
        })),
        skipDuplicates: true
      });

      const createNewAccounts = await tx.user.createMany({
        data: nonExistingEmails.map(email => ({
          email
        })),
        skipDuplicates: true
      });

      const newAccounts = await tx.user.findMany({
        where: {
          email: {
            in: nonExistingEmails
          }
        }
      });

      const assignNewAccounts = await tx.appUser.createMany({
        data: newAccounts.map(account => ({
          appId: appId,
          userId: account.id
        })),
        skipDuplicates: true
      });

      return {
        assignedExisting: assignExistingAccounts.count,
        createdNew: createNewAccounts.count,
        assignedNew: assignNewAccounts.count,
        newAccounts: newAccounts
      };
    });

    let capsuleAccounts = [];
    const accounts = result.newAccounts.map(acc => ({ accountId: acc.id, email: acc.email }));
    for (const account of accounts) {
      const capsuleUser = await createCapsuleAccount(account.accountId, account.email, "user");
      if (capsuleUser.error) {
        console.log("‼️Error occurred while creating capsule account:", capsuleUser.error);
        return;
      }
      if (capsuleUser) {
        capsuleAccounts.push({
          email: account.email,
          walletAddress: capsuleUser.data.walletAddress,
          capsuleTokenVaultKey: capsuleUser.data.capsuleTokenVaultKey
        });
      }
    }

    await prisma.$transaction(
      capsuleAccounts.map(account =>
        userModel.update({
          where: { email: account.email },
          data: {
            walletAddress: account.walletAddress,
            capsuleTokenVaultKey: account.capsuleTokenVaultKey
          }
        })
      )
    );

    const allUsers = await userModel.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        email: true,
        walletAddress: true
      }
    });

    return {
      assigned: result.assignedExisting,
      created: result.createdNew,
      alreadyAssigned: alreadyAssignedAccounts.length,
      total: emails.length,
      users: allUsers
    };
  } catch (e) {
    console.error("Error occurred while creating account:", e);
    return {
      error: e instanceof Error ? e.message : "An unknown error occurred"
    };
  }
}

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

export const refreshAccountSession = async (email: string, accountType: AccountType) => {
  try {
    const newSessionData = await createOrUpdateSession(email, accountType);
    const data = {
      accessToken: newSessionData.accessToken,
      refreshToken: newSessionData.refreshToken,
      developer: {
        walletAddress: newSessionData.walletAddress,
        id: newSessionData.accountId
      },
      message: "Logged in successfully"
    };
    return {
      data,
      status: StatusCodes.OK
    };
  } catch (e) {
    return {
      error: e,
      status: StatusCodes.INTERNAL_SERVER_ERROR
    };
  }
};
