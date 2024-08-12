import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/prisma/models";
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
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const isEmailTaken = await developerAccountModel.findFirst({ where: { email } });
  if (isEmailTaken) {
    return NextResponse.json(
      { error: "Email already taken" },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  //send verification email
  const res = await verificationEmailCodeSend(email);
  if (!!res?.accepted?.length) {
    return NextResponse.json(
      { message: "Verification code sent 📧" },
      { status: StatusCodes.OK },
    );
  }

  return NextResponse.json(
    { error: "Failed to send verification code email." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
