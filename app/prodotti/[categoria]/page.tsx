import { sanityClient } from "@/lib/sanity";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MotionWrapper } from "@/components/MotionWrapper";


export const dynamic = "force-dynamic";
export const revalidate = 60;

type Subcategory = {
  _id: string;
  title: string;
  description: string;
  slug: { current: string };
  imageUrl?: string;
};

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: { categoria: string };
  searchParams?: { q?: string };
}) {
  const slug = params?.categoria;

  if (!slug || typeof slug !== "string") {
    console.error("❌ Slug non valido:", slug);
    return notFound();
  }

  const sottocategorie: Subcategory[] = await sanityClient.fetch(
    `*[_type == "subcategory" && category->slug.current == $slug]{
      _id,
      title,
      description,
      slug,
      "imageUrl": image.asset->url
    }`,
    { slug }
  );

  const search = searchParams?.q?.toLowerCase() || "";
  const filtered = sottocategorie.filter((sub) =>
    sub.title.toLowerCase().includes(search)
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
            <li className="text-gray-700 font-medium">{slug.replace(/-/g, " ")}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-[#C73A3A] mb-10 capitalize text-center">
          {slug.replace(/-/g, " ")}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((sub) => (
            <Link
              href={`/prodotti/${slug}/${sub.slug.current}`}
              key={sub._id}
              className="bg-gray-50 rounded-xl shadow hover:shadow-md transition overflow-hidden group"
            >
              {sub.imageUrl && (
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={sub.imageUrl}
                    alt={sub.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#C73A3A] mb-2">{sub.title}</h2>
                <p className="text-sm text-gray-700">{sub.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </MotionWrapper>
  );
}
