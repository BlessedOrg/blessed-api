import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/models";
import { createDeveloperAccount, refreshAccountSession } from "@/lib/auth/accounts";
import { verifyEmailVerificationCode } from "@/lib/auth/emailVerificationCode";
import { OtpCodeSchema } from "@/lib/zodSchema";

export async function POST(req: NextRequest) {
  const validBody = OtpCodeSchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  const { code } = validBody.data;

  const verifyEmailResult = await verifyEmailVerificationCode(code);

  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const developerExists = await developerAccountModel.findUnique({ where: { email } });
  const isBetaEnv = req.nextUrl.hostname === "localhost";
  if (!developerExists) {
    const { data, status, error } = await createDeveloperAccount(email, isBetaEnv);
    if (!!error) {
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json(data, { status });
  } else {
    if (accepted && email) {
      const { data, error, status } = await refreshAccountSession(email, "developer");
      if (!!error) {
        return NextResponse.json({ error }, { status });
      }
      return NextResponse.json(data, { status });
    } else {
      return NextResponse.json(
        { error: "Invalid code", message: verifyEmailResult.message },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
  }
}
