import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const { user: userModel, userOtp: userOtpModel, session: sessionModel, emailVerificationCode: emailVerificationCodeModel } = prisma;
