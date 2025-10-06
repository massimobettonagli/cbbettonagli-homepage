import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import PartnerGrid from "@/components/PartnerGrid";

type Partner = {
  _id: string;
  name: string;
  website: string;
  logoUrl: string;
};

type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours: { [key: string]: string };
};

export default async function ChiSiamoPage() {
  const partners: Partner[] = await sanityClient.fetch(`*[_type == "partner"]{
    _id,
    name,
    website,
    "logoUrl": logo.asset->url
  }`);

  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    aboutHeroImage { asset->{ url } }
  }`);

  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  const giorniSettimana: { [key: string]: string } = {
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica"
  };

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {/* Hero */}
      {settings?.aboutHeroImage?.asset?.url && (
        <section
          className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${settings.aboutHeroImage.asset.url})` }}
        >
          <div className="bg-white/70 px-8 py-6 rounded-xl shadow-xl">
            <h1 className="text-5xl font-bold text-[#C73A3A] text-center">Chi siamo</h1>
          </div>
        </section>
      )}

      {/* Testo descrizione */}
      <section className="px-6 md:px-20 py-16 max-w-4xl mx-auto">
        <p className="text-gray-700 text-lg leading-relaxed">
          La nostra azienda fu fondata nel 1982 da Claudio Bettonagli che iniziò come assemblatore di tubi flessibili per basse, medie, alte e altissime pressioni.<br /><br />
          Oggi l’azienda ha ampliato la gamma di prodotti, offrendo anche tubazioni per tutti i settori industriali, dal chimico al navale. Il nostro punto di forza è la velocità nell’esecuzione dei tubi flessibili, in grado di rispondere a tutte le necessità di un mercato in continua evoluzione e di una clientela che richiede massima serietà e tempestività nelle consegne.<br /><br />
          Dal 2012 al lavoro di Claudio si sono uniti anche i figli Massimo e Paola e la storica ditta Bettonagli Claudio è stata conferita nella CB BETTONAGLI SRL. Il nome è cambiato, ma la professionalità e la passione per il nostro lavoro sono sempre le stesse!
        </p>
      </section>

      {/* Partner */}
      <section className="bg-gray-50 px-6 md:px-20 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-12 text-[#C73A3A]">I nostri partner</h2>
        <PartnerGrid partners={partners} />
      </section>

      {/* Sedi aziendali */}
      <section className="min-h-screen px-6 md:px-20 py-16 flex flex-col justify-center bg-gray-100">
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
