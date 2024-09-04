import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  apiToken: apiTokenModel,
  developerAccount: developerAccountModel,
  developersUserAccount: developersUserAccountModel,
  accountOtp: accountOtpModel,
  session: sessionModel,
  emailVerificationCode: emailVerificationCodeModel,
  erc20Token: erc20TokenModel,
  smartContract: smartContractModel,
  smartContractInteraction: smartContractInteractionModel,
} = prisma;
