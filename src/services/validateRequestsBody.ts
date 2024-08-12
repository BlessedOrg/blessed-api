import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

const validateRequestsBody = (schema: any, body: any) => {
  const validBody = schema.safeParse(body);

  if (!validBody.success) {

    return NextResponse.json(
      { error: validBody.error },
      { status: StatusCodes.BAD_REQUEST } as any
    );
  }

  return { success: true, data: validBody.data };
};

export default validateRequestsBody;