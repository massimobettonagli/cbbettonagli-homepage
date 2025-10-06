import { sanityClient } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";

export const dynamic = "force-dynamic";

type Category = {
  _id: string;
  title: string;
  description: string;
  slug: { current: string };
  imageData?: {
    asset?: {
      _id: string;
      url?: string;
    };
  };
};

type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours?: { [key: string]: string };
};

export default async function ProdottiPage() {
  const categories: Category[] = await sanityClient.fetch(`*[_type == "category"]{
    _id,
    title,
    description,
    slug,
    "imageData": image {
      asset-> {
        _id,
        url
      }
    }
  }`);

  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    productsHeroImages[] { asset->{ url } }
  }`);

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  const heroImages =
    settings?.productsHeroImages
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
      {/* Hero */}
      <HeroCarousel images={heroImages} title="I nostri prodotti" />

      {/* Categorie di prodotto */}
      <section className="px-6 md:px-20 py-16">
        <h2 className="text-3xl font-semibold mb-12 text-[#C73A3A]">
          Categorie di prodotti
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const imageUrl = cat.imageData?.asset?.url
              ? `${cat.imageData.asset.url}?w=400&h=250&fit=crop`
              : "";

            return (
              <div
                key={cat._id}
                className="bg-gray-50 shadow rounded-xl overflow-hidden flex flex-col min-h-[450px]"
              >
                {imageUrl && (
                  <div className="w-full">
                    <Image
                      src={imageUrl}
                      alt={cat.title}
                      width={400}
                      height={250}
                      className="w-full h-auto object-cover object-center"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {cat.description}
                    </p>
                  </div>
                  <Link
                    href={`/prodotti/${cat.slug.current}`}
                    className="inline-block px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
                  >
                    Scopri
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sedi aziendali */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">
          Sedi aziendali
        </h2>
        <div className="space-y-8">
          {offices.map((office) => {
            const officeName =
              typeof office.name === "string"
                ? office.name
                : office.name?.it ||
                  office.name?.en ||
                  JSON.stringify(office.name);

            const officeAddress =
              typeof office.address === "string"
                ? office.address
                : office.address?.it ||
                  office.address?.en ||
                  JSON.stringify(office.address);

            return (
              <div
                key={office._id}
                className="bg-white shadow rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">
                  {officeName}
                </h3>
                <p className="text-gray-700 mb-4">{officeAddress}</p>
                {office.openingHours && (
                  <div className="mb-4">
                    <h4 className="text-gray-800 font-semibold mb-1">
                      Orari di apertura
                    </h4>
                    {Object.keys(giorniSettimana).map((day) => (
                      <p key={day} className="text-sm text-gray-600">
                        {giorniSettimana[day]}:{" "}
                        {office.openingHours?.[day] || "-"}
                      </p>
                    ))}
                  </div>
                )}
                <Link
                  href="/contatti"
                  className="inline-block px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
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