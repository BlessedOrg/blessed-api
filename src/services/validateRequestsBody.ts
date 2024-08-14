import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

const validateRequestsBody = (schema: any, body: any) => {
  const validBody = schema.safeParse(body);
  
  console.log("🌳 validBody.data: ", validBody.data)

  if (!validBody.success) {

    return NextResponse.json(
      { error: validBody.error },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  return { success: true, data: validBody.data };
};

export default validateRequestsBody;
