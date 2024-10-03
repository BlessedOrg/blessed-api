"use server";
import { developerAccountModel, userModel } from "@/models";
import z from "zod";

const schema = z.object({
  email: z.string().email()
});

export async function validateEmail(email: string, accountType?: AccountType) {
  const validBody = schema.safeParse({ email });

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
