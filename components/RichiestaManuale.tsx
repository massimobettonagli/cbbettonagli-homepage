'use client';

import { useEffect, useRef, useState } from 'react';
import { PlusCircle, CheckCircle, Truck, AlertCircle } from 'lucide-react';

export default function RichiestaManuale() {
  const [descrizione, setDescrizione] = useState('');
  const [immagini, setImmagini] = useState<File[]>([]);
  const [richieste, setRichieste] = useState<{ testo: string; immagini: File[] }[]>([]);
  const [faseFinale, setFaseFinale] = useState(false);
  const [indirizzoSelezionato, setIndirizzoSelezionato] = useState<string>('');
  const [indirizzi, setIndirizzi] = useState<any[]>([]);
  const [mostraAnteprima, setMostraAnteprima] = useState(false);
  const [terminiAccettati, setTerminiAccettati] = useState(false);
  const [erroreTermini, setErroreTermini] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchIndirizzi() {
      try {
        const res = await fetch('/api/user/shipping/list');
        const data = await res.json();
        setIndirizzi(data);
      } catch (err) {
        console.error('Errore nel caricamento indirizzi:', err);
      }
    }
    fetchIndirizzi();
  }, []);

  function handleAddRichiesta(e: React.FormEvent) {
    e.preventDefault();
    if (!descrizione && immagini.length === 0) return;
    setRichieste([...richieste, { testo: descrizione, immagini }]);
    setDescrizione('');
    setImmagini([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImmagini(Array.from(e.target.files));
    }
  }

  async function handleProcedi() {
    if (!indirizzoSelezionato) return;

    const formData = new FormData();
    formData.append('indirizzoId', indirizzoSelezionato);
    formData.append('richieste', JSON.stringify(richieste.map(r => ({ testo: r.testo }))));
    richieste.forEach((r, idx) => {
      r.immagini.forEach((file, i) => {
        formData.append(`file-${idx}-${i}`, file);
      });
    });

    try {
      const res = await fetch('/api/richiesta/pdf', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
        setMostraAnteprima(true);
      } else {
        console.error('Errore durante la generazione del PDF');
      }
    } catch (err) {
      console.error('Errore richiesta PDF:', err);
    }
  }

  function handleConfermaRichiesta() {
    if (!terminiAccettati) {
      setErroreTermini(true);
      return;
    }
    setErroreTermini(false);
    alert('✅ Richiesta confermata e inviata!');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#C73A3A]">Inserisci una richiesta manualmente</h1>

      {!faseFinale && (
        <>
          <form onSubmit={handleAddRichiesta} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Descrizione</label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C73A3A]"
                rows={4}
                placeholder="Descrizione della richiesta"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              ></textarea>
            </div>

            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f] transition whitespace-nowrap">
                Scegli file
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
              <div className="flex-1 text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                {immagini.map((img) => img.name).join(', ')}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-[#C73A3A] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#a72f2f] transition"
            >
              <PlusCircle className="w-5 h-5" /> Aggiungi
            </button>
          </form>

          {richieste.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4 text-[#C73A3A]">Riepilogo richieste</h2>
              <table className="w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
               <thead className="bg-[#F8F8F8] text-gray-700 text-left">
  <tr>
    <th className="p-4 border-b">Descrizione</th>
    <th className="p-4 border-b">Allegati</th>
    <th className="p-4 border-b text-center">Azioni</th>
  </tr>
</thead>
                <tbody>
  {richieste.map((r, index) => (
    <tr key={index} className="odd:bg-white even:bg-gray-50">
      <td className="p-4 align-top whitespace-pre-line border-b">{r.testo}</td>
      <td className="p-4 border-b">
        <ul className="space-y-1 text-sm text-gray-600">
          {r.immagini.map((img, i) => (
            <li key={i}>{img.name}</li>
          ))}
        </ul>
      </td>
      <td className="p-4 border-b text-center">
        <button
          type="button"
          onClick={() => {
            const nuoveRichieste = [...richieste];
            nuoveRichieste.splice(index, 1);
            setRichieste(nuoveRichieste);
          }}
          className="text-red-600 hover:text-red-800 transition"
          title="Elimina riga"
        >
          🗑️
        </button>
      </td>
    </tr>
  ))}
</tbody>
              </table>

              <button
                className="mt-6 flex items-center gap-2 bg-[#C73A3A] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#a72f2f] transition"
                onClick={() => setFaseFinale(true)}
              >
                <CheckCircle className="w-5 h-5" /> Completa
              </button>
            </div>
          )}
        </>
      )}

      {faseFinale && !mostraAnteprima && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-[#C73A3A]">Seleziona indirizzo di spedizione</h2>
          {indirizzi.length === 0 ? (
            <p className="text-gray-600">Nessun indirizzo salvato.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {indirizzi.map((addr) => (
                <div
                  key={addr.id}
                  className={`border rounded-xl p-4 shadow hover:shadow-md cursor-pointer transition ${
                    indirizzoSelezionato === addr.id ? 'border-[#C73A3A] ring-2 ring-[#C73A3A]' : ''
                  }`}
                  onClick={() => setIndirizzoSelezionato(addr.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-[#C73A3A]" />
                    <h4 className="font-semibold text-[#C73A3A]">{addr.label}</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    {addr.name}, {addr.address}, {addr.civicNumber}, {addr.cap} {addr.city}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            className="mt-6 flex items-center gap-2 bg-[#C73A3A] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#a72f2f] transition disabled:opacity-50"
            onClick={handleProcedi}
            disabled={!indirizzoSelezionato}
          >
            <Truck className="w-5 h-5" /> Procedi
          </button>
        </div>
      )}

      {mostraAnteprima && pdfPreviewUrl && (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-2xl font-semibold text-[#C73A3A]">Anteprima richiesta</h2>

          <div className="space-y-4">
            <iframe src={pdfPreviewUrl} width="100%" height="600px" className="border rounded shadow" />
            <a
              href={pdfPreviewUrl}
              download="richiesta.pdf"
              className="inline-block bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f] transition"
            >
              Scarica PDF
            </a>
          </div>

          <div className="flex items-start gap-2">
  <input
    type="checkbox"
    id="termini"
    checked={terminiAccettati}
    onChange={() => {
      setTerminiAccettati(!terminiAccettati);
      setErroreTermini(false); // resetta errore quando cambi lo stato
    }}
    className="mt-1"
  />
  <label htmlFor="termini" className="text-sm text-gray-700">
    Accetto i{' '}
    <a
      href="/termini-condizioni"
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-[#C73A3A] hover:text-[#a72f2f]"
    >
      termini e condizioni del servizio
    </a>
  </label>
</div>

{erroreTermini && (
  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
    ⚠️ Prima di procedere devi accettare i termini e condizioni del servizio.
  </p>
)}
          <button
            onClick={handleConfermaRichiesta}
            className="mt-4 bg-[#C73A3A] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#a72f2f] transition"
          >
            Conferma richiesta
          </button>
        </div>
      )}
    </div>
  );
}