"use server";
import { createSessionTokens } from "@/server/auth/createSessionTokens";
import { developerAccountModel, developersUserAccountModel, sessionModel } from "@/prisma/models";

export async function createOrUpdateSession(email: string, accountType: "dev" | "user") {
  const existingUser: any =
    accountType === "dev"
      ? await developerAccountModel.findUnique({ where: { email } })
      : await developersUserAccountModel.findUnique({ where: { email } });

  if (!existingUser) {
    throw new Error(`User with email ${email} not found`);
    // return { error: "User not found" };
  }

  const {
    hashedRefreshToken,
    hashedAccessToken,
    accessToken,
    refreshToken,
  } = await createSessionTokens({ id: existingUser?.id });

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
  
  const existingSession = await sessionModel.findUnique({
    where: {
      ...existingSessionFilters,
    },
  });

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
    
    if (!updatedSession) {
      return { error: "Session not updated, something went wrong ⛑️" };
    }
    return {
      accessToken,
      refreshToken,
    };
  }
  
  await sessionModel.create({
    data: {
      accessToken: hashedAccessToken,
      refreshToken: hashedRefreshToken,
      ...connectUser,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      ... accountType === "user" && {
        DeveloperAccount: {
          connect: { id: existingUser.developerId }
        }
      }
    },
  });

  console.log("🔑 accessToken: ", accessToken)

  return {
    accessToken,
    refreshToken,
  };
}
