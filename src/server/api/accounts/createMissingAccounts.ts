"use server";

import { importUserToPrivy } from "@/server/auth/importUserToPrivy";
import { developerAccountModel } from "@/prisma/models";

export async function createMissingAccounts(emails: string[]) {
  try {
    const registeredAccounts = await developerAccountModel.findMany({
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

    const registeredEmails = registeredAccounts.map(account => account.email);
    const nonRegisteredEmails = emails.filter(email => !registeredEmails.includes(email));

    if (nonRegisteredEmails.length === 0) {
      return {
        createdAccounts: [],
        registeredAccounts: registeredAccounts
      };
    }

    const createdAccounts = await Promise.all(nonRegisteredEmails.map(async (email) => {
      const privyUser = await importUserToPrivy(email);
      const createdDeveloperAccount = await developerAccountModel.create({
        data: {
          email,
          walletAddress: privyUser.wallet.address
        },
        select: {
          email: true,
          walletAddress: true
        }
      });
      return createdDeveloperAccount;
    }));

    return {
      createdAccounts,
      registeredAccounts
    };

  } catch (e) {
    console.error("Error occurred while creating account:", e);
    return {
      error: e instanceof Error ? e.message : "An unknown error occurred"
    };
  }
}