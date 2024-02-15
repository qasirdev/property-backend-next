
import getFavoriteListings, { IFavoritesParams } from "@/app/actions/getFavoriteListings";
import { NextResponse } from "next/server";

export async function GET(
  request: Request, 
  { params }: { params: IFavoritesParams }
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const favoriteIds = searchParams.get("favoriteIds") as unknown as string;
    const listings = await getFavoriteListings(favoriteIds?.split(','));
    
    return NextResponse.json({data:[...listings]}, { status: 200 });
  }
  catch (e) {
      console.error(e);
      return NextResponse.json({ message: "Something went wrong while trying to load the listings", result: e }, { status: 500 });
  }
}
