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

async function createNewApp(req: NextRequestWithDeveloperAccessToken) {
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

export const POST = withDeveloperAccessToken(createNewApp);

async function getAllMyApps(req: NextRequestWithDeveloperAccessToken) {
  const apps = await appModel.findMany({
    where: {
      developerId: req.developerId
    },
    include: {
      _count: {
        select: {
          SmartContracts: true,
          ApiTokens: true,
          Users: true
        },
      },
    },
  });

  return NextResponse.json(apps, { status: StatusCodes.OK });
}

export const GET = withDeveloperAccessToken(getAllMyApps);
