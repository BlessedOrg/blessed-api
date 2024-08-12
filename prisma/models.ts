import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const { developerAccount: developerAccountModel, accountOtp: accountOtpModel, session: sessionModel, emailVerificationCode: emailVerificationCodeModel } = prisma;
