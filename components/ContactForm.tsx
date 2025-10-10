"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// ✅ reCAPTCHA typings
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    privacyAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");

  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      setSubmitted(true);
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError("");

    if (!formState.privacyAccepted) {
      alert("Per favore accetta la privacy policy.");
      return;
    }

    if (typeof window === "undefined" || !window.grecaptcha) {
      setCaptchaError("reCAPTCHA non è ancora pronto. Riprova tra qualche secondo.");
      return;
    }

    setLoading(true);

    try {
      window.grecaptcha.ready(async () => {
  const token = await window.grecaptcha!.execute(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
    { action: "submit" }
  );

  // 🔍 Opzionale: testare il punteggio lato client (per debugging)
  const debugScore = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${process.env.NEXT_PUBLIC_RECAPTCHA_DEBUG_SECRET}&response=${token}`,
  });

  const debugData = await debugScore.json();
  console.log("🎯 reCAPTCHA score:", debugData?.score);
  // console.log("🧪 reCAPTCHA raw response:", debugData);

  // Prosegui con invio del form
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...formState, token }),
  });

  if (res.status === 403) {
    setCaptchaError("Verifica reCAPTCHA fallita. Riprova più tardi.");
    setLoading(false);
    return;
  }

  if (!res.ok) {
    alert("Errore durante l'invio del messaggio.");
    setLoading(false);
    return;
  }

  window.location.href = "/contatti?success=true";
});
    } catch (error) {
      console.error("Errore invio:", error);
      alert("Errore imprevisto.");
      setLoading(false);
    }
  };

  return (
    <section className="px-6 md:px-20 py-20 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A] text-center">
        Scrivici un messaggio
      </h2>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
        {submitted && (
          <div className="mb-6 flex items-center justify-center gap-3 text-green-700 bg-green-100 border border-green-300 rounded p-4 text-sm">
            ✅ Messaggio inviato con successo! Ti risponderemo al più presto.
          </div>
        )}

        {captchaError && (
          <div className="mb-4 text-red-600 font-medium text-sm">
            ⚠ {captchaError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-700">
              Nome e Cognome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#C73A3A]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#C73A3A]"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold mb-2 text-gray-700">
              Messaggio
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formState.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#C73A3A]"
            />
          </div>

          <label className="text-sm text-gray-700 flex items-start gap-2">
            <input
              type="checkbox"
              name="privacyAccepted"
              checked={formState.privacyAccepted}
              onChange={handleChange}
              required
              className="mt-1"
            />
            Ho letto e accetto la{" "}
            <a href="/privacy-policy" className="underline hover:text-[#C73A3A]">
              Privacy Policy
            </a>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C73A3A] text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Invio in corso..." : "Invia messaggio"}
          </button>
        </form>
      </div>
    </section>
  );
}