import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import { smartContractModel } from "@/models";

export function withTicketValidate(handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context) => {
    try {
      const ticketId = request.nextUrl.pathname.split("/")[6]; // Index 6 for 'applications/:appId/tickets/:ticketId'
      if (!ticketId) {
        return NextResponse.json({ error: "ticketId query param is required" }, { status: StatusCodes.BAD_REQUEST });
      }
      const smartContract = await smartContractModel.findUnique({
        where: {
          id: ticketId,
          name: "tickets"
        }
      });
      if (!smartContract) {
        return NextResponse.json({ error: "Ticket not found" }, { status: StatusCodes.NOT_FOUND });
      }
      Object.assign(request, {
        ticketContractAddress: smartContract.address,
        ticketId
      });

      return handler(request, context);
    } catch (error: any) {
      console.log("🚨 withTicketValidate:", error.message);
      return NextResponse.json({ error: error.message }, { status: StatusCodes.UNAUTHORIZED });
    }
  };
}