import { sanityClient } from "@/lib/sanity";
import RegistratiForm from "@/components/RegistratiForm";
import { type Office } from "@/types";

export default async function RegistratiPage() {
  // Hero image da Sanity
  const settings = await sanityClient.fetch(`*[_type == "settings"][0]{
    "registerHeroImageUrl": registerHeroImage.asset->url
  }`);

  // Uffici da Sanity
  const offices: Office[] = await sanityClient.fetch(`*[_type == "office"]{
    _id,
    name,
    address,
    openingHours
  }`);

  // Normalizziamo openingHours per evitare null
 const normalizedOffices: Office[] = offices.map((o) => ({
  ...o,
  openingHours: o.openingHours ?? {}, // sempre oggetto, mai null
}));

return (
  <RegistratiForm
    heroUrl={settings?.registerHeroImageUrl || ""}
    offices={normalizedOffices}
  />
);
}