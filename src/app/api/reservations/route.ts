import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import getReservations, { IReservationsParams } from "@/app/actions/getReservations";
import { verifyJwt } from "@/utils/jwt";

export async function POST(
  request: Request, 
) {
  const accessToken = request.headers.get("Authorization");
  const body = await request.json();
  const { 
    listingId,
    startDate,
    endDate,
    totalPrice,
    userId,
    provider
   } = body;

   if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
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

  const listingAndReservation = await prisma.listing.update({
    where: {
      id: listingId
    },
    data: {
      reservations: {
        create: {
          userId: userId,
          startDate,
          endDate,
          totalPrice,
        }
      }
    }
  });

  return NextResponse.json(listingAndReservation);
}
export async function GET(
  request: Request,
  { params }: { params: IReservationsParams }
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams as IReservationsParams;
    const reservations = await getReservations(searchParams);
    return NextResponse.json({data:[...reservations]});
  } catch (error) {
    console.error("Error fetching reservations action:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
