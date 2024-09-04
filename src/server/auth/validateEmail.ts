"use server";
import { developerAccountModel, developersUserAccountModel } from "@/prisma/models";
import z from "zod";
import { sessionType } from "@prisma/client";

const schema = z.object({
  email: z.string().email()
});

export async function validateEmail(email: string, accountType?: sessionType) {
  console.log(`🍄 Welcome to validateEmail`);
  console.log("🔮 email: ", email)
  console.log("🔮 accountType: ", accountType)
  const validBody = schema.safeParse({ email });
  console.log("🔮 validBody: ", validBody)

  if (!validBody.success) {
    throw new Error(`${validBody.error}`);
  }

  const isEmailTaken = accountType === "dev"
    ? await developerAccountModel.findFirst({ where: { email } })
    : await developersUserAccountModel.findFirst({ where: { email } });

  console.log("🌳 isEmailTaken: ", isEmailTaken)
  
  if (isEmailTaken) {
    throw new Error("Email already taken");
  }

  return !!isEmailTaken;
}