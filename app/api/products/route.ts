import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

type Product = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  category?: {
    title?: string;
    slug?: {
      current?: string;
    };
  };
  subcategory?: {
    title?: string;
    slug?: {
      current?: string;
    };
    parent?: {
      slug?: string;
    };
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.toLowerCase() || "";
  const categoria = searchParams.get("categoria") || "";
  const sottocategoria = searchParams.get("sottocategoria") || "";

  const allProducts: Product[] = await sanityClient.fetch(`*[_type == "product"]{
    _id,
    title,
    description,
    "slug": slug.current,
    "imageUrl": images[0].asset->url,
    "category": category-> {
      title,
      slug
    },
    "subcategory": subcategory-> {
      title,
      slug,
      parent->{ slug }
    }
  }`);

  const filtered = allProducts.filter((p) => {
    const matchesSearch = q ? p.title.toLowerCase().includes(q) : true;
    const matchesCategoria = categoria ? p.category?.slug?.current === categoria : true;
    const matchesSottocategoria = sottocategoria ? p.subcategory?.slug?.current === sottocategoria : true;
    return matchesSearch && matchesCategoria && matchesSottocategoria;
  });

  return NextResponse.json(filtered);
}


