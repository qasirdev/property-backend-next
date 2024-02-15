import prisma from "@/libs/prismadb";

export interface IFavoritesParams {
  favoriteIds:string[]
}

export default async function getFavoriteListings(
  params: any
) {
  try {
    const favoriteIds = params;

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(favoriteIds || [])]
        }
      }
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    return safeFavorites;
  } catch (error: any) {
    throw new Error(error);
  }
}
