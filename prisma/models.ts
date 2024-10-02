import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  app: appModel,
  apiToken: apiTokenModel,
  developerAccount: developerAccountModel,
  developersUserAccount: developersUserAccountModel,
  accountOtp: accountOtpModel,
  session: sessionModel,
  emailVerificationCode: emailVerificationCodeModel,
  erc20Token: erc20TokenModel,
  smartContract: smartContractModel,
  smartContractInteraction: smartContractInteractionModel,
  appUser: appUserModel
} = prisma;
