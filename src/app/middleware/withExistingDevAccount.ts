import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { developerAccountModel } from "@/models";

export function withExistingDevAccount(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {

  return async (request: NextRequest, context: { params: { developerId: string } }) => {
    const developerAccount = await developerAccountModel.findUnique({
      where: {
        id: context.params.developerId
      }
    });

    if (!developerAccount) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return handler(request, context);
  };
}
