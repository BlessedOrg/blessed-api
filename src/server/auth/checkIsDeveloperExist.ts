"use server";

import { developerAccountModel } from "@/prisma/models";

export async function checkIsDeveloperExist(developerId: string) {
  const getDevData = await developerAccountModel.findUnique({
    where: {
      id: developerId,
    },
  });
  if (!getDevData) {
    return {
      error: "Developer not found",
      status: false,
    };
  }
  return {
    status: true,
  };
}
