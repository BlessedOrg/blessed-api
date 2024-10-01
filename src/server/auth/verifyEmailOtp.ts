"use server";
import { emailVerificationCodeModel } from "@/prisma/models";

export async function verifyEmailOtp(code: string) {
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
    // await emailVerificationCodeModel.delete({
    //   where: {
    //     id: existingCodeData.id,
    //   },
    // });
    return {
      accepted: false,
      email: undefined,
      message: "Code expired",
    };
  }

  // await emailVerificationCodeModel.delete({
  //   where: {
  //     id: existingCodeData.id,
  //   },
  // });

  return {
    accepted: true,
    email: existingCodeData.email,
  };
}
