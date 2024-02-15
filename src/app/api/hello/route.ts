import { NextResponse } from "next/server";

export async function GET(
  request: Request, 
  { params }: any
) {
  return NextResponse.json({
    data: {'hello':'world'}
  });
}