import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  apiToken: apiTokenModel,
  developerAccount: developerAccountModel,
  developersUserAccount: developersUserAccountModel,
  accountOtp: accountOtpModel,
  session: sessionModel,
  emailVerificationCode: emailVerificationCodeModel,
  smartContract: smartContractModel
} = prisma;
