import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(
  request: Request, 
  { params }: any
) {
  const rawToken = await getToken({ request, raw: true });
  return NextResponse.json({ token: rawToken });
}