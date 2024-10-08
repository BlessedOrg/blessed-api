import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  app: appModel,
  developerAccount: developerAccountModel,
  user: userModel,
  accountOtp: accountOtpModel,
  userSession: userSessionModel,
  developerSession: developerSessionModel,
  emailVerificationCode: emailVerificationCodeModel,
  erc20Token: erc20TokenModel,
  smartContract: smartContractModel,
  smartContractInteraction: smartContractInteractionModel,
  appUser: appUserModel
} = prisma;
