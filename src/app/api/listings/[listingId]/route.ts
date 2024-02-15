import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import getListingById from "@/app/actions/getListingById";
import { verifyJwt } from "@/utils/jwt";

interface IParams {
  listingId?: string;
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

  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') {
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

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: userId
    }
  });

  return NextResponse.json(listing);
}

export async function GET(
  request: Request, 
  { params }: { params: IParams }
) {
try {
  const listing = await getListingById(params);
  return NextResponse.json({data:listing}, { status: 200 });
}
catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Something went wrong while trying to load the listings", result: e }, { status: 500 });
}
}