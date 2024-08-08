import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { sessionModel, userModel } from "@/prisma/models";
import { createAndDeployAccount } from "@/app/server/createAndDeployAccount";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  const isValidEmail = (email: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const isEmailTaken = await userModel.findFirst({ where: { email } });
  if (isEmailTaken) {
    return NextResponse.json(
      { error: "Email already taken" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const createdUser = await userModel.create({
    data: {
      email,
    },
  });
  if (createdUser) {
    const accessToken = jwt.sign(
      { id: createdUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: "2d" },
    );
    const refreshToken = uuidv4();

    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const createdUserSession = await sessionModel.create({
      data: {
        accessToken: hashedAccessToken,
        refreshToken: hashedRefreshToken,
        user: {
          connect: {
            id: createdUser.id,
          },
        },
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });

    const deployedUserAccount = await createAndDeployAccount(createdUser.email);
    console.log(`🚀 Deployed user account:`, deployedUserAccount);
    if (deployedUserAccount?.contractAddress) {
     await userModel.update({
        where: {
          email,
        },
        data: {
          walletAddress: deployedUserAccount.contractAddress,
          accountDeployed: true,
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
    } else {
      await userModel.update({
        where: {
          email,
        },
        data: {
          vaultKey: deployedUserAccount.vaultKey,
        },
      });
    }

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: {
          email,
          isDeployed: !!deployedUserAccount?.contractAddress,
          walletAddress: deployedUserAccount?.contractAddress,
          vaultKey: deployedUserAccount?.vaultKey,
        },
      },
      { status: StatusCodes.OK },
    );
  }

  return NextResponse.json(
    { error: "Failed to create user" },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
