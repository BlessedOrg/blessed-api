import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { createMissingAccounts } from "@/lib/auth/accounts";
import { userModel } from "@/models";
import { withApiKeyOrDevAccessToken } from "@/app/middleware/withApiKeyOrDevAccessToken";
import z from "zod";
import { withAppValidate } from "@/app/middleware/withAppValidate";

async function getHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
  const { appId } = req;

  const users = await userModel.findMany({
    where: {
      Apps: {
        some: {
          appId
        }
      }
    }
  });
  return NextResponse.json(users, { status: StatusCodes.OK });
}

export const GET = withApiKeyOrDevAccessToken(withAppValidate(getHandler));

const UsersSchema = z.object({
  users: z.array(z.object({ email: z.string().email() })).nonempty()
});
async function postHandler(req: NextRequestWithApiKeyOrDevAccessToken & NextRequestWithAppValidate) {
  const { appId } = req;
  const validBody = UsersSchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  const { users } = validBody.data;

  const createdUsers = await createMissingAccounts(users.map(i => i.email), appId, req.nextUrl.hostname === "localhost");
  return NextResponse.json(createdUsers, { status: StatusCodes.OK });
}

export const POST = withApiKeyOrDevAccessToken(withAppValidate(postHandler));