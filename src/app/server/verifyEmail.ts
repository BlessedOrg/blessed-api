"use server";

import { emailVerificationCodeModel, userModel } from "@/prisma/models";

export async function verifyEmail(code: string) {
  const existingCodeData = await emailVerificationCodeModel.findFirst({
    where: {
      code,
    },
  });
  if (!existingCodeData) {
    return {
      accepted: false,
      email: undefined,
    };
  }

  const isEmailTaken = await userModel.findFirst({
    where: { email: existingCodeData.email },
  });

  if (isEmailTaken) {
    return {
      accepted: false,
      email: undefined,
      message: "Email already taken",
      isEmailTaken: true,
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
