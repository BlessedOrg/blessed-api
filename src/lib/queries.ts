"use server";
import { appModel, developerAccountModel, userModel } from "@/models";
import z from "zod";

export const getAppIdBySlug = (slug: string) => {
  return appModel.findUnique({
    where: {
      slug
    }
  });
}

export const getUserIdByEmail = async (email: string) => {
  const userData = await userModel.findUnique({
    where: { email },
    select: { id: true }
  });
  if (!userData) {
    throw new Error("User not found");
  }
  return userData.id;
};

const emailDuplicateSchema = z.object({
  email: z.string().email(),
});
export const checkForEmailDuplicate = async (email: string, accountType?: AccountType) => {
  const validBody = emailDuplicateSchema.safeParse({ email });

  if (!validBody.success) {
    throw new Error(`${validBody.error}`);
  }

  const isEmailTaken =
    accountType === "developer"
      ? await developerAccountModel.findFirst({ where: { email } })
      : await userModel.findFirst({ where: { email } });

  // if (isEmailTaken) {
  //   throw new Error("Email already taken")
  // }

  return !!isEmailTaken;
}
