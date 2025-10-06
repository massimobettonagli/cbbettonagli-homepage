import { sanityClient } from "@/lib/sanity";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { PortableTextBlock } from "@portabletext/types";

type Article = {
  title: string;
  publishedAt: string;
  images?: { asset?: { url?: string } }[];
  content: PortableTextBlock[];
};

type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours?: { [key: string]: string };
};

// ✅ Generazione dei parametri statici
export async function generateStaticParams() {
  const slugs: string[] = await sanityClient.fetch(
    `*[_type == "article" && defined(slug.current)][].slug.current`
  );
  return slugs.map((slug) => ({ slug }));
}

// ✅ Firma corretta e compatibile con Next.js 15 App Router
export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const article: Article | null = await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      title,
      publishedAt,
      images[]{asset->{url}},
      "content": body
    }`,
    { slug }
  );

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  if (!article) {
    return <div className="p-8">Articolo non trovato</div>;
  }

  const { title, publishedAt, images = [], content } = article;

  const giorniSettimana: { [key: string]: string } = {
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
  };

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {/* Breadcrumb */}
      <div className="px-6 md:px-20 pt-24">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:underline">Home</Link> &gt;{" "}
          <Link href="/news" className="hover:underline">News</Link> &gt;{" "}
          <span className="text-gray-700">{title}</span>
        </nav>

        <h1 className="text-4xl font-bold text-[#C73A3A] mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-8">
          {publishedAt ? new Date(publishedAt).toLocaleDateString("it-IT") : "Data non disponibile"}
        </p>
      </div>

      {/* Testo contenuto */}
      <section className="px-6 md:px-20 pb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none text-left">
          <PortableText value={content} />
        </div>
      </section>

      {/* Immagini */}
      {images.length > 0 && (
        <section className="px-6 md:px-20 pb-24">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img, index) => (
              img.asset?.url && (
                <div key={index} className="break-inside-avoid rounded overflow-hidden">
                  <Image
                    src={img.asset.url}
                    alt={`Articolo immagine ${index + 1}`}
                    width={800}
                    height={500}
                    layout="responsive"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* Contatti */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">Sedi aziendali</h2>
        <div className="space-y-8">
          {offices.map((office) => {
            const officeName =
              typeof office.name === "string"
                ? office.name
                : office.name?.it || office.name?.en || JSON.stringify(office.name);

            const officeAddress =
              typeof office.address === "string"
                ? office.address
                : office.address?.it || office.address?.en || JSON.stringify(office.address);

            return (
              <div key={office._id} className="bg-white shadow rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">{officeName}</h3>
                <p className="text-gray-700 mb-4">{officeAddress}</p>
                {office.openingHours && (
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-1">Orari di apertura</h4>
                    {Object.keys(giorniSettimana).map((day) => (
                      <p key={day} className="text-sm text-gray-600">
                        {giorniSettimana[day]}: {office.openingHours?.[day] || "-"}
                      </p>
                    ))}
                  </div>
                )}
                <Link href="/contatti" className="inline-block px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">Contattaci</Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}