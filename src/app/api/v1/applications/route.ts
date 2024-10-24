import { appModel } from "@/models";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import slugify from "slugify";
import { withDevAccessToken } from "@/app/middleware/withDevAccessToken";

const postSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  imageUrl: z.string().optional()
});

async function createNewApp(req: NextRequestWithDevAccessToken) {
  const parsedBody = postSchema.safeParse(await req.json());
  const { name, description, imageUrl } = parsedBody.data;
  const slug = slugify(name, {
    lower: true,
    strict: true,
    trim: true
  });

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: `Invalid request body. The proper fields are: name (string, min 3 signs)` },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const existingAppWithName = await appModel.findFirst({
    where: {
      developerId: req.developerId,
      name
    }
  });
  if (existingAppWithName) {
    return NextResponse.json(
      { error: `App with name ${name} already exists.` },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const existingAppWithSlug = await appModel.findFirst({
    where: {
      developerId: req.developerId,
      slug
    }
  });
  if (existingAppWithSlug) {
    return NextResponse.json(
      { error: `App with slug ${slug} already exists.` },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const app = await appModel.create({
    data: {
      name,
      slug,
      developerId: req.developerId,
      ...(description && { description }),
      ...(imageUrl && { imageUrl })
    }
  });

  return NextResponse.json(app, { status: StatusCodes.OK });
}

export const POST = withDevAccessToken(createNewApp);

async function getAllMyApps(req: NextRequestWithDevAccessToken) {
  const apps = await appModel.findMany({
    where: {
      developerId: req.developerId
    },
    include: {
      _count: {
        select: {
          SmartContracts: true,
          Users: true
        }
      }
    }
  });

  return NextResponse.json(apps, { status: StatusCodes.OK });
}

export const GET = withDevAccessToken(getAllMyApps);
