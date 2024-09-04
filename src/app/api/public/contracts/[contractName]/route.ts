import {NextRequest, NextResponse} from "next/server";
import {getContractsFunctions} from "@/contracts/interfaces";
import {StatusCodes} from "http-status-codes";
import {withDeveloperApiToken} from "@/app/middleware/withDeveloperApiToken";

async function handler(req: NextRequest, { params: { contractName } }){
   const functions = getContractsFunctions(contractName);

    return NextResponse.json({functions},{status: StatusCodes.OK});
}

export const GET = withDeveloperApiToken(handler)