import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { validateEmail } from "@/server/auth/validateEmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  const emailValidation: any = await validateEmail(
    email,
    req.nextUrl.hostname === "localhost",
    "dev"
  );

  if (emailValidation) {
    return NextResponse.json(
      { message: emailValidation?.message },
      { status: emailValidation?.status },
    );
  }

  return NextResponse.json(
    { error: "Failed to send verification code email." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
