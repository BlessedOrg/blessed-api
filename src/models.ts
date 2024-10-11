import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  app: appModel,
  developerAccount: developerAccountModel,
  user: userModel,
  userSession: userSessionModel,
  developerSession: developerSessionModel,
  emailVerificationCode: emailVerificationCodeModel,
  smartContract: smartContractModel,
  smartContractInteraction: smartContractInteractionModel,
  appUser: appUserModel,
  apiToken: apiTokenModel
} = prisma;
