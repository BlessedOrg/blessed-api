import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

const apiToken = `wvNoszpnD3ENS6cXSHeRYVPj85suevbZ`; // hardcoded for now

export function withAuth(handler) {
  return async (request) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED });
    }

    const token = authHeader.split(' ')[1];

    if (token !== apiToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: StatusCodes.UNAUTHORIZED });
    }

    return handler(request);
  };
}