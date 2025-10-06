import { sanityClient } from "@/lib/sanity";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";

export const revalidate = 60;

type Download = {
  _id: string;
  title: string;
  pdfUrl: string;
};

type Office = {
  _id: string;
  name: string;
  address: string;
  openingHours: { [key: string]: string };
};

export default async function DownloadsPage() {
  // Hero
  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    downloadsHeroImages[] { asset->{url} }
  }`);

  const heroImages =
    settings?.downloadsHeroImages
      ?.map((img: { asset?: { url?: string } }) => img.asset?.url)
      .filter((url): url is string => !!url) || [];

  // Documenti
  const downloads: Download[] = await sanityClient.fetch(`*[_type == "download"] | order(_createdAt desc){
    _id,
    title,
    "pdfUrl": file.asset->url
  }`);

  // Contatti
  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      <HeroCarousel images={heroImages} title="Downloads" />

      <div className="px-6 md:px-20 pt-6">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link> &gt; <span className="text-gray-700">Downloads</span>
        </nav>
      </div>

      {/* Lista download */}
      <section className="px-6 md:px-20 py-16 min-h-[90vh] flex flex-col">
  <h2 className="text-3xl font-semibold mb-12 text-[#C73A3A] text-center">Documenti scaricabili</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 items-center justify-center">
    {downloads.map((item) => (
      <div key={item._id} className="bg-gray-50 shadow rounded-xl p-6 flex flex-col justify-between">
        <h3 className="text-xl font-semibold mb-4 text-[#C73A3A]">{item.title}</h3>
        <iframe
          src={item.pdfUrl}
          className="w-full h-64 mb-4 rounded"
          frameBorder="0"
          loading="lazy"
        />
        <a
          href={item.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Scarica
        </a>
      </div>
    ))}
  </div>
</section>

      {/* Contatti */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">Sedi aziendali</h2>
        <div className="space-y-8">
          {offices.map((office/*, index*/) => (
            <div key={office._id} className="bg-white shadow rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">{office.name}</h3>
              <p className="text-gray-700 mb-4">{office.address}</p>
              {office.openingHours && (
                <div className="mb-4">
                  <h4 className="text-gray-800 font-semibold mb-1">Orari di apertura</h4>
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <p key={day} className="text-sm text-gray-600">
                      {{
                        monday: "Lunedì",
                        tuesday: "Martedì",
                        wednesday: "Mercoledì",
                        thursday: "Giovedì",
                        friday: "Venerdì",
                        saturday: "Sabato",
                        sunday: "Domenica"
                      }[day]}: {office.openingHours[day] || "-"}
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
          ))}
        </div>
      </section>
    </main>
  );
}