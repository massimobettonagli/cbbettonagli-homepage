'use client';

import { useState } from 'react';

type Richiesta = {
  testo: string;
  allegati?: File[];
};

type Indirizzo = {
  id: string;
  label: string;
  address: string;
  city: string;
  cap: string;
};

export default function RiepilogoRichiesta({
  richieste,
  indirizzi,
  onBack,
  resetRichieste,
}: {
  richieste: Richiesta[];
  indirizzi: Indirizzo[];
  onBack: () => void;
  resetRichieste: () => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!selectedId) {
      alert('Seleziona un indirizzo di spedizione');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/richiesta/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ richieste, indirizzoId: selectedId }),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(true);
        resetRichieste();
      } else {
        setError(json.error || 'Errore invio richiesta');
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-[#C73A3A]">Riepilogo richiesta</h2>

      <div className="space-y-4">
        {richieste.map((r, i) => (
          <div key={i} className="border rounded p-4">
            <p className="font-semibold">{r.testo}</p>
            {Array.isArray(r.allegati) && r.allegati.length > 0 && (
              <ul className="list-disc ml-6 text-sm mt-2">
                {r.allegati.map((f, idx) => (
                  <li key={idx}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-2">
          Seleziona indirizzo di spedizione
        </label>
        <select
          className="w-full border p-3 rounded"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Seleziona --</option>
          {indirizzi.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.label} - {ind.address}, {ind.city} ({ind.cap})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm">
          ✅ Richiesta inviata con successo!
        </p>
      )}

      <div className="flex gap-4 mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
        >
          Indietro
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C73A3A] text-white hover:bg-[#a72f2f] transition disabled:opacity-50"
        >
          {loading ? 'Invio...' : 'Invia richiesta'}
        </button>
      </div>
    </div>
  );
}
