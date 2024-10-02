// import { NextRequest, NextResponse } from "next/server";
// import { getContractsFunctions } from "@/contracts/cairo/interfaces";
// import { StatusCodes } from "http-status-codes";
// import { withApiToken } from "@/app/middleware/withApiToken";
//
// async function handler(req: NextRequest, { params: { contractName } }) {
//   const functions = getContractsFunctions(contractName);
//   return NextResponse.json({ functions }, { status: StatusCodes.OK });
// }
//
// export const GET = withApiToken(handler);
