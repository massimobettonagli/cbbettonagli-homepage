import Image from "next/image";
import Link from "next/link";
import PartnerGrid from "@/components/PartnerGrid";
import HeroCarousel from "@/components/HeroCarousel";
import { sanityClient } from "@/lib/sanity";


export default async function HomePage() {


  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    homeHeroImages[] { asset->{ url } }
  }`);

  const images = settings?.homeHeroImages
    ?.map((img: { asset?: { url?: string } }) => img?.asset?.url)
    .filter((url): url is string => typeof url === "string") || [];

  const categories = await sanityClient.fetch(`*[_type == "category"]{
  _id,
  title,
  description,
  slug,
  image {
    asset-> {
      _id,
      url
    }
  }
}`);


  const partners = await sanityClient.fetch(`*[_type == "partner"]{
    _id,
    name,
    website,
    "logoUrl": logo.asset->url
  }`);

  const offices = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  const articles = await sanityClient.fetch(`*[_type == "article"] | order(publishedAt desc)[0...4]{
  _id,
  title,
  slug,
  publishedAt,
  "previewImage": images[0].asset->url
}`);



const certifications = await sanityClient.fetch(`*[_type == "certification"] | order(_createdAt desc){
  _id,
  title,
  "pdfUrl": pdf.asset->url
}`);

const downloads = await sanityClient.fetch(`*[_type == "download"] | order(_createdAt desc){
  _id,
  title,
  "pdfUrl": file.asset->url
}`);

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
   

      <Link href="/chi-siamo">
        <div className="cursor-pointer">
          <HeroCarousel images={images} title="Esplora la realtà" />
        </div>
      </Link>

      <section className="min-h-screen px-6 md:px-20 py-16 flex flex-col justify-center">
        <h2 className="text-3xl font-semibold mb-12 text-[#C73A3A]">Categorie di prodotti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
  const transformedUrl = cat.image?.asset?.url
    ? `${cat.image.asset.url}?w=300&h=220&fit=crop`
    : "";

  return (
    <div key={cat._id} className="bg-gray-50 shadow rounded-xl overflow-hidden flex flex-col">
      {transformedUrl && (
        <div className="w-full h-auto">
          <Image
            src={transformedUrl}
            alt={cat.title}
            width={300}
            height={220}
            className="w-full object-cover object-center rounded-t-xl"
          />
        </div>
      )}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-xl font-bold mb-2 text-[#C73A3A]">{cat.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
        </div>
        <Link
          href={`/prodotti/${cat.slug.current}`}
          className="inline-block px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
        >
          scopri
        </Link>
      </div>
    </div>
  );
})}
        </div>
      </section>

      <section className="min-h-screen px-6 md:px-20 py-16 flex flex-col justify-center bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-[#C73A3A]">Articoli</h2>
          <Link href="/news" className="inline-block px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">scopri tutti i contenuti</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <div key={article._id} className="bg-gray-50 rounded-xl shadow p-4 flex flex-col justify-between">
              {article.previewImage && (
                <div className="relative w-full h-40 mb-4">
                  <Image
                    src={article.previewImage}
                    alt={article.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("it-IT") : ""}
                </p>
                <h3 className="text-lg font-semibold mb-2 text-[#C73A3A]">{article.title}</h3>
              </div>
              <Link href={`/news/${article.slug.current}`} className="inline-block mt-4 px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition">Continua a leggere</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-20 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-12 text-[#C73A3A]">I nostri partner</h2>
        <PartnerGrid partners={partners} />
      </section>
	
	<section className="px-6 md:px-20 py-20 bg-gray-100">
  <h2 className="text-2xl font-semibold mb-12 text-[#C73A3A]">Certificazioni</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {certifications.map((cert) => (
      <div key={cert._id} className="bg-gray-50 shadow rounded-xl p-6 flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-4 text-[#C73A3A]">{cert.title}</h3>
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

<section className="min-h-screen px-6 md:px-20 py-16 flex flex-col justify-center">
  <h2 className="text-2xl font-semibold mb-12 text-[#C73A3A]">Downloads</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {downloads.map((item) => (
      <div key={item._id} className="bg-gray-50 shadow rounded-xl p-6 flex flex-col justify-between">
        <h3 className="text-xl font-bold mb-4 text-[#C73A3A]">{item.title}</h3>
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
          className="inline-block mt-auto px-4 py-2 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
        >
          Scarica PDF
        </a>
      </div>
    ))}
  </div>
</section>


<section className="min-h-screen px-6 md:px-20 py-16 flex flex-col justify-center bg-gray-100">
  <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">Sedi aziendali</h2>
  <div className="space-y-8">
    {offices.map((office) => {
      // Prendi sempre il valore come stringa, fallback a JSON.stringify SOLO se ancora oggetto
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
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <p key={day} className="text-sm text-gray-600">
                  {{
                    monday: "Lunedì",
                    tuesday: "Martedì",
                    wednesday: "Mercoledì",
                    thursday: "Giovedì",
                    friday: "Venerdì",
                    saturday: "Sabato",
                    sunday: "Domenica",
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
      );
    })}
  </div>
</section>
     
    </main>
  );
}


