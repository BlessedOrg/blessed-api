import { appModel } from "@/prisma/models";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import z from "zod";

const postSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  imageUrl: z.string().optional()
});

async function postHandler(req: NextRequestWithDevAuth) {
  const parsedBody = postSchema.safeParse(await req.json());
  const { name, description, imageUrl } = parsedBody.data;

  const app = await appModel.create({
    data: {
      name,
      developerId: req.developerId,
      ...(description && { description }),
      ...(imageUrl && { imageUrl })
    }
  });

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: `Invalid request body. The proper fields are: name (string, min 3 signs)` },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  return NextResponse.json(app, { status: StatusCodes.OK });
}

export const POST = withDeveloperAccessToken(postHandler);
