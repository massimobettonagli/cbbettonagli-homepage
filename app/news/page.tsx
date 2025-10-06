import { sanityClient } from "@/lib/sanity";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import Image from "next/image";

type Article = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  previewImage?: string;
};

type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours?: { [key: string]: string };
};

export default async function ListaArticoliPage() {
  const articles: Article[] = await sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      "previewImage": images[0].asset->url
    }`
  );

  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    newsHeroImages[] { asset->{ url } }
  }`);

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  const heroImages: string[] =
    settings?.newsHeroImages
      ?.map((img: { asset?: { url?: string } }) => img.asset?.url)
      .filter((url): url is string => !!url) || [];

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
      <HeroCarousel images={heroImages} title="Articoli" />

      {/* Breadcrumb */}
      <div className="px-6 md:px-20 pt-6">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">Home</Link> &gt; <span className="text-gray-700">Articoli</span>
        </nav>
      </div>

      {/* Lista articoli */}
      <section className="px-6 md:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article._id} className="bg-white shadow rounded-xl overflow-hidden flex flex-col">
              {article.previewImage && (
                <div className="relative w-full h-48">
                  <Image
                    src={article.previewImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("it-IT") : "Data non disponibile"}
                  </p>
                  <h2 className="text-xl font-semibold mb-4 text-[#C73A3A]">{article.title}</h2>
                </div>
                <Link
                  href={`/news/${article.slug.current}`}
                  className="inline-block mt-auto px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
                >
                  Leggi di più
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                <Link href="/contatti" className="inline-block px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">
                  Contattaci
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
