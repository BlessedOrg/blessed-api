"use server";
import { userModel } from "@/models";

export async function getUserIdByEmail(email: string) {
  const userData = await userModel.findUnique({
    where: { email },
    select: { id: true }
  });
  if (!userData) {
    throw new Error("User not found");
  }
  return userData.id;
}
