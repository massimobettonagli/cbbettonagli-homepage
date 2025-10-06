import { sanityClient } from "@/lib/sanity";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { MotionWrapper } from "@/components/MotionWrapper";
import { PortableTextBlock } from "@portabletext/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type ImageAsset = { asset: { url: string } };
type ProductData = {
  title: string;
  description?: string;
  body?: PortableTextBlock[];
  images?: ImageAsset[];
  sheet?: { asset?: { url?: string } };
  subcategory?: { title: string; slug: { current: string } };
  category?: { title: string; slug: { current: string } };
};

export default async function ProdottoPage({
  params,
}: {
  params: { categoria: string; sottocategoria: string; prodotto: string };
}) {
  const { categoria, sottocategoria, prodotto } = params;

  if (!categoria || !sottocategoria || !prodotto) {
    console.error("❌ Parametri mancanti:", params);
    return notFound();
  }

  const prodottoData: ProductData | null = await sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      title,
      description,
      images[]{ asset->{ url } },
      sheet{ asset->{ url } },
      body,
      subcategory->{ title, slug },
      category->{ title, slug }
    }`,
    { slug: prodotto }
  );

  if (!prodottoData) {
    return notFound();
  }

  return (
    <MotionWrapper>
      <main className="w-full px-6 md:px-20 py-20 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <ol className="flex flex-wrap items-center space-x-1">
            <li><Link href="/" className="hover:underline text-gray-500">Home</Link><span className="mx-1">/</span></li>
            <li><Link href="/prodotti" className="hover:underline text-gray-500">Prodotti</Link><span className="mx-1">/</span></li>
            <li>
              <Link href={`/prodotti/${prodottoData.category?.slug?.current}`} className="hover:underline text-gray-500">
                {prodottoData.category?.title}
              </Link><span className="mx-1">/</span>
            </li>
            <li>
              <Link href={`/prodotti/${prodottoData.category?.slug?.current}/${prodottoData.subcategory?.slug?.current}`} className="hover:underline text-gray-500">
                {prodottoData.subcategory?.title}
              </Link><span className="mx-1">/</span>
            </li>
            <li className="text-gray-700 font-medium">{prodottoData.title}</li>
          </ol>
        </nav>

        {/* Titolo */}
        <h1 className="text-4xl font-bold text-[#C73A3A] mb-6">{prodottoData.title}</h1>

        {/* Descrizione breve */}
        {prodottoData.description && (
          <p className="text-gray-600 text-lg mb-10">{prodottoData.description}</p>
        )}

        {/* Testo contenuto lungo */}
        {prodottoData.body && (
          <div className="prose prose-lg text-gray-800 mb-16">
            <PortableText value={prodottoData.body} />
          </div>
        )}

        {/* Galleria immagini */}
        {prodottoData.images && prodottoData.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {prodottoData.images.map((img, idx) => (
              <div key={idx} className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow">
                <Image
                  src={img.asset.url}
                  alt={`Immagine ${idx + 1} di ${prodottoData.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottone scarica PDF */}
        {prodottoData.sheet?.asset?.url && (
          <div className="text-center mt-8">
            <a
              href={prodottoData.sheet.asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Scarica scheda tecnica
            </a>
          </div>
        )}
      </main>
    </MotionWrapper>
  );
}