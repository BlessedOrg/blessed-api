"use server";
import { importUserToPrivy } from "@/server/auth/importUserToPrivy";
import { developerAccountModel } from "@/prisma/models";

export async function createMissingAccounts(emails: string[]) {
  try {
    const existingAccounts = await developerAccountModel.findMany({
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

    const registeredEmails = existingAccounts.map(account => account.email);
    const nonRegisteredEmails = emails.filter(email => !registeredEmails.includes(email));

    if (nonRegisteredEmails.length === 0) {
      return {
        newAccounts: [],
        existingAccounts: existingAccounts
      };
    }

    const newAccounts = await Promise.all(nonRegisteredEmails.map(async (email) => {
      const privyUser = await importUserToPrivy(email);
      return developerAccountModel.create({
        data: {
          email,
          walletAddress: privyUser.wallet.address
        },
        select: {
          email: true,
          walletAddress: true
        }
      });
    }));

    return {
      newAccounts,
      existingAccounts
    };

  } catch (error) {
    console.error("🚨 Error while creating account:", error.message);
    return error;
  }
}
