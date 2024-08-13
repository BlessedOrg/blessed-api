'use server';

import {StatusCodes} from "http-status-codes";
import {developersUserAccountModel, developerAccountModel} from "@/prisma/models";
import {verificationEmailCodeSend} from "@/server/auth/verificationEmailCodeSend";

export async function validateEmail(email: string, accountType?: "dev" | "user"){
    const isValidEmail = (email: string) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    };

    if (!email || !isValidEmail(email)) {
        return { message: "Invalid email format", status: StatusCodes.BAD_REQUEST  }
    }

    const isEmailTaken = accountType === "dev" ?  await developerAccountModel.findFirst({ where: { email } }) : await developersUserAccountModel.findFirst({ where: { email } });
    if (isEmailTaken) {
        return { message: "Email already taken", status: StatusCodes.BAD_REQUEST  }
    }

    //send verification email
    const res = await verificationEmailCodeSend(email);
    if (!!res?.accepted?.length) {
        return { message: "Verification code sent 📧", status: StatusCodes.OK  }
    }

    return false
}