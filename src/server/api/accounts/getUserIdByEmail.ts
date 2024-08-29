"use server";
import { developersUserAccountModel } from "@/prisma/models";

export async function getUserIdByEmail(email: string) {
  const userData = await developersUserAccountModel.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!userData) {
    throw new Error("User not found");
  }
  return userData.id;
}
