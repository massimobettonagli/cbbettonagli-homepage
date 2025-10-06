import { sanityClient } from "@/lib/sanity";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MotionWrapper } from "@/components/MotionWrapper";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Product = {
  _id: string;
  title: string;
  description: string;
  slug: { current: string };
  imageUrl?: string;
  category?: { slug?: { current: string } };
};

export default async function SottocategoriaPage({
  params,
  searchParams,
}: {
  params: { categoria: string; sottocategoria: string };
  searchParams?: { q?: string };
}) {
  const { categoria, sottocategoria } = params;

  if (!categoria || !sottocategoria) {
    console.error("❌ Parametri mancanti:", params);
    return notFound();
  }

  const prodotti: Product[] = await sanityClient.fetch(
    `*[_type == "product" && category->slug.current == $categoria && subcategory->slug.current == $sottocategoria]{
      _id,
      title,
      description,
      slug,
      "imageUrl": images[0].asset->url,
      category->{slug}
    }`,
    { categoria, sottocategoria }
  );

  const search = searchParams?.q?.toLowerCase() || "";
  const filtered = prodotti.filter((prod) =>
    prod.title.toLowerCase().includes(search)
  );

  if (!filtered.length) {
    return notFound();
  }

  return (
    <MotionWrapper>
      <main className="w-full px-6 md:px-20 py-20">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <ol className="flex flex-wrap items-center space-x-1">
            <li>
              <Link href="/" className="hover:underline text-gray-500">Home</Link>
              <span className="mx-1">/</span>
            </li>
            <li>
              <Link href="/prodotti" className="hover:underline text-gray-500">Prodotti</Link>
              <span className="mx-1">/</span>
            </li>
            <li>
              <Link href={`/prodotti/${categoria}`} className="hover:underline text-gray-500">
                {categoria.replace(/-/g, " ")}
              </Link>
              <span className="mx-1">/</span>
            </li>
            <li className="text-gray-700 font-medium">
              {sottocategoria.replace(/-/g, " ")}
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-[#C73A3A] mb-10 capitalize text-center">
          {sottocategoria.replace(/-/g, " ")}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((prod) => (
            <Link
              key={prod._id}
              href={`/prodotti/${prod.category?.slug?.current}/${sottocategoria}/${prod.slug.current}`}
              className="bg-gray-50 rounded-xl shadow hover:shadow-md transition overflow-hidden group"
            >
              {prod.imageUrl && (
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={prod.imageUrl}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#C73A3A] mb-2">{prod.title}</h2>
                <p className="text-sm text-gray-700">{prod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </MotionWrapper>
  );
}