import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

const parseRequestBody = (schema: any, body: any) => {
  const parsedBody = schema.safeParse(body);

  if (!parsedBody.success) {

    return NextResponse.json(
      { error: parsedBody.error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  return { success: true, data: parsedBody.data };
};

export default parseRequestBody;
