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
      createdAccounts,
      registeredAccounts
    };

  } catch (error) {
    console.error("🚨 Error while creating account:", error.message);
    return error;
  }
}
