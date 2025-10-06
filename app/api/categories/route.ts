import { sanityClient } from "@/lib/sanity";

export async function GET() {
  try {
    const categories = await sanityClient.fetch(`*[_type == "category"]{
      _id,
      title,
      slug
    }`);

    return new Response(JSON.stringify(categories), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Errore caricamento categorie:", error);
    return new Response("Errore server", { status: 500 });
  }
}
