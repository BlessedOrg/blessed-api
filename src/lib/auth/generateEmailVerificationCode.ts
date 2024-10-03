"use server";
import { generateOTP } from "@/utils/generateOtp";
import { emailVerificationCodeModel } from "@/models";

type VerificationEmailParams = {
  to: string;
  expirationTimeMinutes?: number;
  isLocalhost: boolean;
};

export async function generateEmailVerificationCode({ to, expirationTimeMinutes, isLocalhost }: VerificationEmailParams) {
  const code = generateOTP();
  const newCode = await emailVerificationCodeModel.create({
    data: {
      code,
      email: to,
      expiresAt: !!expirationTimeMinutes
        ? new Date(Date.now() + expirationTimeMinutes * 60 * 1000)
        : new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });
  if (newCode) {
    console.log(`📧 Created verification code record:`, newCode.code);
  }

  return newCode;
}
