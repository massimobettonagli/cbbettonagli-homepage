import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const subcategories = await sanityClient.fetch(
      `*[_type == "subcategory"]{
        _id,
        title,
        slug,
        category->{slug}
      }`
    );

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Errore caricando le sottocategorie:", error);
    return new NextResponse("Errore nel recupero delle sottocategorie", { status: 500 });
  }
}



