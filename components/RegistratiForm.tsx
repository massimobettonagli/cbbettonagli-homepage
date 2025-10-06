'use client';

import { useState } from "react";
import Link from "next/link";

type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours: { [key: string]: string };
};

export default function RegistratiForm({
  heroUrl,
  offices,
}: {
  heroUrl?: string;
  offices: Office[];
}) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Errore durante la registrazione.");
      return;
    }

    setSuccess(true);
    setFormData({ name: "", email: "", password: "" });
  }

  const giorniSettimana = {
    monday: "Lunedì", tuesday: "Martedì", wednesday: "Mercoledì",
    thursday: "Giovedì", friday: "Venerdì", saturday: "Sabato", sunday: "Domenica"
  };

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {heroUrl && (
        <section
          className="relative w-full min-h-[60vh] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url('${heroUrl}')` }}
        >
          <div className="bg-white/80 px-8 py-6 rounded-xl shadow-xl">
            <h1 className="text-5xl font-bold text-[#C73A3A] text-center">Registrati</h1>
          </div>
        </section>
      )}

      <section className="px-6 md:px-20 py-16 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="name" placeholder="Nome e Cognome" required className="w-full p-3 border rounded"
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="email" name="email" placeholder="Email" required className="w-full p-3 border rounded"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" name="password" placeholder="Password" required className="w-full p-3 border rounded"
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

          {success && <p className="text-green-600 text-sm">Registrazione completata!</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
  type="submit"
  className="w-full bg-[#C73A3A] text-white py-3 rounded-lg hover:bg-[#a72f2f] transition"
>
  Registrati
</button>
        </form>
      </section>

      <section className="px-6 md:px-20 py-16 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-8 text-[#C73A3A]">Sedi aziendali</h2>
        <div className="space-y-8">
          {offices.map((office) => {
            const officeName = typeof office.name === "string" ? office.name : office.name?.it || "Sede";
            const officeAddress = typeof office.address === "string" ? office.address : office.address?.it || "";
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