"use server";
import { emailVerificationCodeModel } from "@/models";
import { generateOTP } from "@/utils/generateOtp";

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


export async function verifyEmailVerificationCode(code: string) {
  const existingCodeData = await emailVerificationCodeModel.findFirst({
    where: {
      code,
    },
  });
  if (!existingCodeData) {
    return {
      accepted: false,
      email: undefined,
      message: "Invalid code",
    };
  }

  if (new Date(existingCodeData.expiresAt).getTime() < new Date().getTime()) {
    await emailVerificationCodeModel.delete({
      where: {
        id: existingCodeData.id,
      },
    });
    return {
      accepted: false,
      email: undefined,
      message: "Code expired",
    };
  }

  await emailVerificationCodeModel.delete({
    where: {
      id: existingCodeData.id,
    },
  });

  return {
    accepted: true,
    email: existingCodeData.email,
  };
}
