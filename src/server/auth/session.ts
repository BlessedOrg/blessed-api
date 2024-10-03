"use server";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { developerAccountModel, developersUserAccountModel, sessionModel } from "@/prisma/models";
import { sessionType } from "@prisma/client";

export async function createOrUpdateSession(email: string, accountType: sessionType) {
  const existingUser: any =
    accountType === "dev"
      ? await developerAccountModel.findUnique({ where: { email } })
      : await developersUserAccountModel.findUnique({ where: { email } });
  
  
  console.log("🐬 existingUser: ", existingUser)

  if (!existingUser) {
    throw new Error(`User with email ${email} not found`);
  }

  const { hashedRefreshToken, hashedAccessToken, accessToken, refreshToken } = await createSessionTokens({
    id: existingUser?.id,
  });

  console.log({ hashedRefreshToken, hashedAccessToken, accessToken, refreshToken });

  const connectUser =
    accountType === "dev"
      ? {
          DeveloperAccount: {
            connect: {
              id: existingUser.id,
            },
          },
        }
      : {
          DevelopersUserAccount: {
            connect: {
              id: existingUser.id,
            },
          },
        };

  const existingSessionFilters: any =
    accountType === "dev"
      ? {
          developerId: existingUser.id,
        }
      : {
          developerUserId: existingUser.id,
        };

  const existingSession = await sessionModel.findFirst({
    where: {
      ...existingSessionFilters,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  console.log("🎄 existingSession: ", existingSession)

  if (existingSession) {
    const updatedSession = await sessionModel.update({
      where: {
        id: existingSession.id,
      },
      data: {
        accessToken: hashedAccessToken,
        refreshToken: hashedRefreshToken,
        ...connectUser,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("🔥 updatedSession: ", updatedSession)

    if (!updatedSession) {
      return { error: "Session not updated, something went wrong ⛑️" };
    }
    return {
      accessToken,
      refreshToken,
      walletAddress: existingUser.walletAddress,
    };
  }

  const newSession = await sessionModel.create({
    data: {
      accessToken: hashedAccessToken,
      refreshToken: hashedRefreshToken,
      ...connectUser,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      sessionType: sessionType[accountType],
      DeveloperAccount: {
        connect: {
          id: accountType === "dev" ? existingUser.id : existingUser.developerId,
        },
      },
    },
  });
  
  console.log("🐥 newSession: ", newSession)

  console.log("🔑 accessToken: ", accessToken);

  console.log({
    accessToken,
    refreshToken,
    walletAddress: existingUser.walletAddress,
  });

  return {
    accessToken,
    refreshToken,
    walletAddress: existingUser.walletAddress,
  };
}
