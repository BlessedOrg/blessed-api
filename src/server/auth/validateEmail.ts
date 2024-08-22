'use server';

import { StatusCodes } from "http-status-codes";
import { developerAccountModel, developersUserAccountModel } from "@/prisma/models";
import { sendVerificationEmailCode } from "@/server/auth/sendVerificationEmailCode";
import z from "zod";
import {NextResponse} from "next/server";

const schema = z.object({
    email: z.string().email(),
});

export async function validateEmail(email: string, isLocalhost: boolean, accountType?: "dev" | "user"){
    const validBody = schema.safeParse({email});

    if (!validBody.success) {
        return NextResponse.json(
            { error: validBody.error },
            { status: StatusCodes.BAD_REQUEST }
        );
    }

    const isEmailTaken = accountType === "dev"
      ? await developerAccountModel.findFirst({ where: { email } })
      : await developersUserAccountModel.findFirst({ where: { email } });

    if (isEmailTaken) {
        return { message: "Email already taken", status: StatusCodes.BAD_REQUEST  }
    }

    const res = await sendVerificationEmailCode({
      to: email,
      isLocalhost,
    });

    if (!!res?.accepted?.length) {
        return { message: "Verification code sent 📧", status: StatusCodes.OK  }
    }

    return false
}