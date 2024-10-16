import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { userModel } from "@/models";
import { createUserAccount, refreshAccountSession } from "@/lib/auth/accounts";
import { verifyEmailVerificationCode } from "@/lib/auth/emailVerificationCode";
import { withApiKey } from "@/app/middleware/withApiKey";
import { OtpCodeSchema } from "@/lib/zodSchema";
import { withAppValidate } from "@/app/middleware/withAppValidate";

async function postHandler(req: NextRequestWithAppValidate) {
  const { appId } = req;
  const validBody = OtpCodeSchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  const { code } = validBody.data;
  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, { status: StatusCodes.BAD_REQUEST } as any);
  }
  const verifyEmailResult = await verifyEmailVerificationCode(code);

  const { accepted, email } = verifyEmailResult;
  if (!accepted || !email) {
    return NextResponse.json(
      { error: "Invalid code", verifyEmailResult },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
  const userExists = await userModel.findUnique({ where: { email } });
  if (!userExists) {
    const { data, status, error } = await createUserAccount(email, appId, req.nextUrl.hostname === "localhost");
    if (!!error) {
      return NextResponse.json({ error }, { status });
    }
    return NextResponse.json(data, { status });
  } else {
    if (accepted && email) {
      const { data, error, status } = await refreshAccountSession(email, "user", appId);
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
export const POST = withApiKey(withAppValidate(postHandler));