import { sanityClient } from "@/lib/sanity";

export const fetchHomeHeroImages = async (): Promise<string[]> => {
  try {
    const result = await sanityClient.fetch(`*[_type == "settings"][0]{
      homeHeroImages[] {
        asset->{
          url
        }
      }
    }`);

    const images = result?.homeHeroImages
      ?.map((img: { asset?: { url?: string } }) => img?.asset?.url)
      .filter((url): url is string => typeof url === "string");

    return images || [];
  } catch (error) {
    console.error("Errore nel recupero delle immagini da Sanity:", error);
    return [];
  }
};

