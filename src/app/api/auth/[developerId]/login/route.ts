import {developersUserAccountModel} from "@/prisma/models";
import {NextResponse} from "next/server";
import {StatusCodes} from "http-status-codes";
import {verificationEmailCodeSend} from "@/server/auth/verificationEmailCodeSend";
import {withExistingDevAccount} from "@/app/middleware/withExistingDevAccount";

 async function handler(req: Request) {
    const body = await req.json();
    const { email } = body;


    const userData = await developersUserAccountModel.findUnique({
        where: {
            email
        }
    });

    if(!userData){
        return NextResponse.json({error: "User not found"}, {
            status: StatusCodes.NOT_FOUND
        });
    }

    const otpCodeSent = await verificationEmailCodeSend(email, 2)
    if(otpCodeSent){
        return NextResponse.json({message: "Verification code sent successfully"}, {
            status: StatusCodes.OK
        });
    } else {
        return NextResponse.json({error: "Failed to send verification code email."}, {
            status: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
}

export const POST = withExistingDevAccount(handler);