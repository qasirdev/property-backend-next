import { NextResponse } from "next/server";

import prisma from "@/libs/prismadb";
import { verifyJwt } from "@/utils/jwt";

interface IParams {
  listingId?: string;
}

export async function POST(
  request: Request, 
  { params }: { params: IParams }
) {
  const body = await request.json();
  const {favoriteIds:customerFavoriteIds} = body;
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

  let favoriteIds = [...(customerFavoriteIds || [])];

  favoriteIds.push(listingId);
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      favoriteIds
    }
  });

  return NextResponse.json({data: user});
}

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {


  const accessToken = request.headers.get("Authorization");
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const customerFavoriteIds = searchParams.get("favoriteIds") as unknown as string;
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

  let favoriteIds = [...(customerFavoriteIds?.split(',') || [])];
  favoriteIds = favoriteIds.filter((id) => id !== listingId);
 
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      favoriteIds
    }
  });

  return NextResponse.json(user);

}
export async function GET(
  request: Request, 
  { params }: any
) {
  return NextResponse.json({
    data: {'hello':'world'}
  });
}