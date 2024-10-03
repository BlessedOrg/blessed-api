import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { verifyEmailOtp } from "@/lib/emails/auth/verifyEmailOtp";
import { userModel } from "@/models";
import { refreshAccountSession } from "@/lib/auth/accounts/refreshAccountSession";
import { getAppIdBySlug } from "@/lib/app";
import { createUserAccount } from "@/lib/auth/accounts/createUserAccount";

export async function POST(req: Request, { params: { appSlug } }) {
  const body = await req.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, {
      status: StatusCodes.BAD_REQUEST
    } as any);
  }
  const { id: appId } = await getAppIdBySlug(appSlug);
  const verifyEmailResult = await verifyEmailOtp(code);

  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const userExists = await userModel.findUnique({ where: { email } });
  if (!userExists) {
    const { data, status, error } = await createUserAccount(email, appId);
    if (!!error) {
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json(data, { status });
  } else {
    if (accepted && email) {
      const { data, error, status } = await refreshAccountSession(email, "user");
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
