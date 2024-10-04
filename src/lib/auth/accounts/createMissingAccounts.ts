"use server";
import { prisma, userModel } from "@/models";
import { createCapsuleAccount } from "@/lib/auth/accounts/createCapsuleAccount";

export async function createMissingAccounts(emails: string[], appId: string) {
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

    const capsuleAccounts = await createCapsuleAccounts(result.newAccounts.map(acc => ({ accountId: acc.id, email: acc.email })));

    for (const capsuleAccount of capsuleAccounts) {
      await userModel.update({
        where: { email: capsuleAccount.email },
        data: {
          walletAddress: capsuleAccount.walletAddress,
          capsuleTokenVaultKey: capsuleAccount.capsuleTokenVaultKey
        }
      });
    }

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

const createCapsuleAccounts = async (accounts: { email: string, accountId: string }[]): Promise<{ email: string, walletAddress: string, capsuleTokenVaultKey: string }[]> => {
  let capsuleAccounts = [];
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
  return capsuleAccounts;
};