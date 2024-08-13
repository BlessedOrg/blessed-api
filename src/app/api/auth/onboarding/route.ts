import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {validateEmail} from "@/server/auth/validateEmail";
import z from "zod";
import validateRequestsBody from "@/services/validateRequestsBody";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validBody = validateRequestsBody(schema, body);
  const { email } = validBody;

  const emailValidation: any = await validateEmail(email, "dev");
  if(emailValidation) {
    return NextResponse.json(
      { message: emailValidation?.message},
      { status: emailValidation?.status },
    );
  }

  return NextResponse.json(
    { error: "Failed to send verification code email." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
