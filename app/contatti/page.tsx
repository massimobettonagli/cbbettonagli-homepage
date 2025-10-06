import { sanityClient } from "@/lib/sanity";
import HeroCarousel from "@/components/HeroCarousel";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

type Office = {
  _id: string;
  name: string;
  companyName: string;
  taxCode: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
  mapsLink?: string;
  openingHours?: { [key: string]: string };
};

export default async function ContattiPage() {
  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    contactsHeroImages[] { asset->{ url } }
  }`);

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    companyName,
    taxCode,
    vatNumber,
    address,
    phone,
    email,
    "mapsLink": mapsUrl,
    openingHours
  }`);

  const heroImages: string[] =
    settings?.contactsHeroImages
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
      <HeroCarousel images={heroImages} title="Contattaci" />

      <section className="px-6 md:px-20 py-20">
        <h2 className="text-2xl font-semibold mb-12 text-[#C73A3A] text-center">Sedi aziendali</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {offices.map((office, index) => (
            <div
              key={office._id}
              className={`bg-white shadow rounded-xl p-6 transition-transform hover:scale-105 ${
                offices.length % 2 !== 0 && index === offices.length - 1
                  ? "md:col-span-2 md:mx-auto"
                  : ""
              }`}
            >
              <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">{office.name}</h3>
              <p className="text-gray-700 font-semibold">{office.companyName}</p>
              <p className="text-gray-700">P.IVA: {office.vatNumber}</p>
              <p className="text-gray-700 mb-2">C.F.: {office.taxCode}</p>
              <p className="text-gray-700 mb-2">{office.address}</p>

              {office.phone && (
                <a
                  href={`tel:${office.phone.replace(/\s+/g, "")}`}
                  className="text-gray-700 hover:text-[#C73A3A] hover:underline block"
                >
                  {office.phone}
                </a>
              )}

              <p className="text-gray-700 mb-4">
                <a
                  href={`mailto:${office.email}`}
                  className="hover:underline text-black"
                >
                  {office.email}
                </a>
              </p>

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

              {office.mapsLink && (
                <iframe
                  src={office.mapsLink}
                  width="100%"
                  height="200"
                  loading="lazy"
                  className="mb-4 rounded"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <ContactForm />
    </main>
  );
}