"use server";
import { developerAccountModel, developersUserAccountModel } from "@/prisma/models";
import z from "zod";
import { sessionType } from "@prisma/client";

const schema = z.object({
  email: z.string().email(),
});

export async function validateEmail(email: string, accountType?: sessionType) {
  const validBody = schema.safeParse({ email });

  if (!validBody.success) {
    throw new Error(`${validBody.error}`);
  }

  const isEmailTaken =
    accountType === "dev"
      ? await developerAccountModel.findFirst({ where: { email } })
      : await developersUserAccountModel.findFirst({ where: { email } });

  return !!isEmailTaken;
}
