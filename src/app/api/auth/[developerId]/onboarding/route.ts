import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { validateEmail } from "@/server/auth/validateEmail";
import { withExistingDevAccount } from "@/app/middleware/withExistingDevAccount";

async function handler(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  const emailValidation: any = await validateEmail(
    email,
    req.nextUrl.hostname === "localhost",
    "user",
  );

  if (emailValidation) {
    return NextResponse.json(
      { message: emailValidation?.message },
      { status: emailValidation.status },
    );
  }

  return NextResponse.json(
    { error: "Failed to send verification code email." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR } as any,
  );
}
export const POST = withExistingDevAccount(handler);