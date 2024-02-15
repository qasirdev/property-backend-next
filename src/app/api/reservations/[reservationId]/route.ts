import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import { verifyJwt } from "@/utils/jwt";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {


  const accessToken = request.headers.get("Authorization");
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const userId = searchParams.get("userId") as unknown as string;
  const provider = searchParams.get("provider") as unknown as string;

  const { reservationId } = params;
  if (!reservationId || typeof reservationId !== 'string') {
    throw new Error('Invalid ID');
  }

  if (provider === 'credentials') {
    const decoded = verifyJwt(accessToken);
    if (!accessToken || !decoded) {
      return NextResponse.json({ message: "You are not authorized to get this data" }, { status: 401 });
    }
  } else {
    const getToken = await prisma.account.findFirst({
      where: {
        userId: userId,
      },
    });
    if (getToken) {
      if (accessToken === getToken.access_token!) {
        return NextResponse.json({ message: "You are not authorized to get this data" }, { status: 401 });
      }
    }
  } 

  const reservation = await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      OR: [
        { userId: userId },
        { listing: { userId: userId } }
      ]
    }
  });

  return NextResponse.json(reservation);
}

export async function GET(
  request: Request, 
  { params }: any
) {
  return NextResponse.json({
    data: {'hello':'world'}
  });
}