"use server";

import { emailVerificationCodeModel} from "@/prisma/models";

export async function verifyEmail(code: string, accountType: "dev" | "user") {
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
