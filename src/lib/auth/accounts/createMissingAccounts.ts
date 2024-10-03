"use server";

import { importUserToPrivy } from "@/lib/auth/importUserToPrivy";
import { developersUserAccountModel, prisma } from "@/models";

export async function createMissingAccounts(emails: string[], appId: string) {
  try {
    const existingAccounts = await developersUserAccountModel.findMany({
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

    const privyAccounts = await createPrivyAccounts(nonExistingEmails);

    const result = await prisma.$transaction(async (tx) => {
      const assignExistingAccounts = await tx.appUser.createMany({
        data: accountsToAssign.map(account => ({
          appId: appId,
          userId: account.id
        })),
        skipDuplicates: true
      });

      const createNewAccounts = await tx.developersUserAccount.createMany({
        data: privyAccounts.map(account => ({
          email: account.email,
          walletAddress: account.walletAddress
        })),
        skipDuplicates: true
      });

      const newAccounts = await tx.developersUserAccount.findMany({
        where: {
          email: {
            in: privyAccounts.map(account => account.email)
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
        assignedNew: assignNewAccounts.count
      };
    });

    return {
      assigned: result.assignedExisting,
      created: result.createdNew,
      alreadyAssigned: alreadyAssignedAccounts.length,
      total: emails.length
    };
  } catch (e) {
    console.error("Error occurred while creating account:", e);
    return {
      error: e instanceof Error ? e.message : "An unknown error occurred"
    };
  }
}

const createPrivyAccounts = async (emails: string[]): Promise<{ email: string, walletAddress: string }[]> => {
  let privyAccounts = [];
  for (const email of emails) {
    const privyUser = await importUserToPrivy(email);
    if (privyUser) {
      privyAccounts.push({
        email: email,
        walletAddress: privyUser.wallet.address
      });
    }
  }
  return privyAccounts;
};