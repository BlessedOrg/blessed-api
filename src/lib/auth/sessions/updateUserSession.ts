import { userModel, userSessionModel } from "@/models";
import { createSessionTokens } from "@/lib/auth/createSessionTokens";

export const updateUserSession = async (email: string, appId) => {
  const user = await userModel.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  const existingSession = await userSessionModel.findFirst({
    where: {
      userId: user.id
    }
  });

  if (existingSession?.id) {
    const { hashedRefreshToken, hashedAccessToken, accessToken, refreshToken } = await createSessionTokens({
      id: user?.id,
      capsuleTokenVaultKey: user.capsuleTokenVaultKey,
      walletAddress: user.walletAddress
    });
    const updatedSession = await userSessionModel.update({
      where: {
        id: existingSession.id
      },
      data: {
        accessToken: hashedAccessToken,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });

    if (!updatedSession) {
      return { error: "Session not updated, something went wrong ⛑️" };
    }
    return {
      accessToken,
      refreshToken,
      walletAddress: user.walletAddress,
      userId: user.id
    };
  } else {
    const { accessToken, refreshToken } = await createSessionTokens({
      id: user?.id,
      capsuleTokenVaultKey: user.capsuleTokenVaultKey,
      walletAddress: user.walletAddress
    });
    const newSession = await userSessionModel.create({
      data: {
        userId: user.id,
        appId,
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      accessToken,
      refreshToken,
      walletAddress: user.walletAddress,
      userId: user.id
    };
  }
};