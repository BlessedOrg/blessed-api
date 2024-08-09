import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {sessionModel, userModel} from "@/prisma/models";
import { createAndDeployAccount } from "@/server/createAndDeployAccount";
import {verifyEmail} from "@/server/verifyEmail";

export async function POST(req: Request) {
    const body = await req.json();
    const { code } = body;

    if (!code) {
        return NextResponse.json(
            { error: "Invalid code format" },
            { status: StatusCodes.BAD_REQUEST },
        );
    }

    const verifyEmailResult = await verifyEmail(code);
    const {accepted, email, isEmailTaken} = verifyEmailResult;
       if(!accepted || !email) {
        return NextResponse.json(
            { error: "Invalid code", verifyEmailResult },
            { status: StatusCodes.BAD_REQUEST },
        );
       }

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
                    verifyEmailResult
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
