import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { userModel } from "@/prisma/models";
import { verificationEmailCodeSend } from "@/server/verificationEmailCodeSend";

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
      { status: StatusCodes.BAD_REQUEST } as any,
    );
  }

  const isEmailTaken = await userModel.findFirst({ where: { email } });
  if (isEmailTaken) {
    return NextResponse.json(
      { error: "Email already taken" },
      { status: StatusCodes.BAD_REQUEST } as any,
    );
  }

  //send verification email
  const res = await verificationEmailCodeSend(email);
  if (!!res?.accepted?.length) {
    return NextResponse.json(
      { message: "Verification code sent 📧" },
      { status: StatusCodes.OK } as any,
    );
  }

  return NextResponse.json(
    { error: "Failed to send verification code email." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR } as any,
  );
}
