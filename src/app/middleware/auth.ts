import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

const apiToken = `wvNoszpnD3ENS6cXSHeRYVPj85suevbZ`; // hardcoded for now

export function withAuth(handler: (req: NextRequest, context: { params: any }) => Promise<NextResponse> | NextResponse) {
  return async (request: NextRequest, context: { params: any }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED });
    }

    const token = authHeader.split(' ')[1];

    if (token !== apiToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: StatusCodes.UNAUTHORIZED });
    }

    return handler(request, context);
  };
}