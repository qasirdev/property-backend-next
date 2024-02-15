import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import { verifyJwt } from "@/utils/jwt";
import getListings, { IListingsParams } from "@/app/actions/getListings";

export async function POST(
  request: Request, 
) {
    const accessToken = request.headers.get("Authorization");
    const decoded = verifyJwt(accessToken);

    if (!accessToken || !decoded) {
        return NextResponse.json({ message: "You are not authorized to get this data" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      location,
      price,
      userId
    } = body;

    Object.keys(body).forEach((value: any) => {
      if (!body[value]) {
        NextResponse.error();
      }
    });

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        roomCount,
        bathroomCount,
        guestCount,
        locationValue: location.value,
        price: parseInt(price, 10),
        userId: userId
      }
    });

    return NextResponse.json(listing);
}

export async function GET(
    request: Request, 
    { params }: { params: IListingsParams }
  ) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams as IListingsParams;
    const listings = await getListings(searchParams);
    
    return NextResponse.json({data:[...listings]}, { status: 200 });
  }
  catch (e) {
      console.error(e);
      return NextResponse.json({ message: "Something went wrong while trying to load the listings", result: e }, { status: 500 });
  }
}
