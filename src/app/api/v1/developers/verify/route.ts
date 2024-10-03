import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmailVerificationCode } from "@/lib/auth/verifyEmailVerificationCode";
import { developerAccountModel } from "@/models";
import { createDeveloperAccount } from "@/lib/auth/accounts/createDeveloperAccount";
import { refreshAccountSession } from "@/lib/auth/accounts/refreshAccountSession";

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, {
      status: StatusCodes.BAD_REQUEST
    } as any);
  }

  const verifyEmailResult = await verifyEmailVerificationCode(code);

  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const developerExists = await developerAccountModel.findUnique({ where: { email } });
  if (!developerExists) {
    const { data, status, error } = await createDeveloperAccount(email);
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
        {
          status: StatusCodes.BAD_REQUEST
        }
      );
    }
  }

}
