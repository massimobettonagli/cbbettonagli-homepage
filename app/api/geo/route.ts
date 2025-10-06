export async function GET(req: Request) {
  // 🔍 Ottieni l'IP dall'header (x-forwarded-for se dietro proxy, oppure REMOTE_ADDR fallback)
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "me"; // "me" usa l'IP del richiedente

  try {
    const geoRes = await fetch(`https://freegeoip.app/json/${ip}`);
    const geoData = await geoRes.json();

    return new Response(JSON.stringify(geoData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Errore durante la geolocalizzazione:", err);
    return new Response(JSON.stringify({ error: "Geo API error" }), {
      status: 500,
    });
  }
}

