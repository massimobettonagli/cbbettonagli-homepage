export const dynamic = "force-dynamic";

import { sanityClient } from "@/lib/sanity";
import Link from "next/link";

type Certification = {
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

export default async function CertificazioniPage() {
  const settings = await sanityClient.fetch(
  `*[_type == "settings"][0]{
    certificationsHeroImage { asset->{ url } }
  }`,
  {},
  { cache: "no-store" } // 👈 forza Next.js a NON usare cache
);

  const certificazioni: Certification[] = await sanityClient.fetch(`*[_type == "certification"] | order(_createdAt desc) {
    _id,
    title,
    "pdfUrl": pdf.asset->url
  }`);

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {/* HERO */}
      {settings?.certificationsHeroImage?.asset?.url && (
        <section
          className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
          style={{
  backgroundImage: `url(${settings.certificationsHeroImage.asset.url}?v=${new Date().getTime()})`
}}
        >
          <div className="bg-white/70 px-8 py-6 rounded-xl shadow-xl">
            <h1 className="text-5xl font-bold text-[#C73A3A] text-center">Le nostre certificazioni</h1>
          </div>
        </section>
      )}

      {/* Breadcrumb */}
      <div className="px-6 md:px-20 pt-6">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Home</Link> &gt; <span className="text-gray-700">Certificazioni</span>
        </nav>
      </div>

      {/* Lista certificazioni */}
      <section className="px-6 md:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificazioni.map((cert) => (
            <div key={cert._id} className="bg-gray-50 shadow rounded-xl p-6 flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-4 text-[#C73A3A]">{cert.title}</h2>
              <iframe
                src={cert.pdfUrl}
                className="w-full h-64 mb-4 rounded"
                frameBorder="0"
                loading="lazy"
              />
              <a
                href={cert.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-auto px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
              >
                Scarica PDF
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Sedi aziendali */}
      <section className="px-6 md:px-20 py-20 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">Sedi aziendali</h2>
        <div className="space-y-8">
          {offices.map((office) => (
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
              <Link href="/contatti" className="inline-block px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">
                Contattaci
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}