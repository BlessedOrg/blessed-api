import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const {
  developerAccount: developerAccountModel,
  developersUserAccount: developersUserAccountModel,
  accountOtp: accountOtpModel,
  session: sessionModel,
  emailVerificationCode: emailVerificationCodeModel,
} = prisma;
