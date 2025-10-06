"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import socket from '@/lib/socket';

interface RichiestaAdmin {
  id: string;
  numero: number;
  anno: number;
  stato: "INVIATA" | "IN_LAVORAZIONE" | "COMPLETATA";
  createdAt: string;
  utente: {
    id: string;
    name: string | null;
    email: string;
  };
  indirizzoSpedizione: {
    label: string;
    address: string;
    city: string;
  };
  offerta?: {
    fileUrl: string;
    vista: boolean;
  } | null;
}

const statiDisponibili = ["INVIATA", "IN_LAVORAZIONE", "COMPLETATA"] as const;
type StatoRichiesta = typeof statiDisponibili[number];

export default function TabellaRichiesteAdmin({ richieste: initialRichieste }: { richieste: RichiestaAdmin[] }) {
  const [richieste, setRichieste] = useState(initialRichieste);
  const [fileMap, setFileMap] = useState<{ [id: string]: File | null }>({});
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const router = useRouter();

  const statoIcona = {
    INVIATA: <Clock className="text-yellow-500 w-5 h-5" />, 
    IN_LAVORAZIONE: <Loader className="text-blue-500 w-5 h-5 animate-spin" />, 
    COMPLETATA: <CheckCircle className="text-green-600 w-5 h-5" />,
  };

  const aggiornaStato = async (id: string, nuovoStato: string, utenteId: string) => {
    const res = await fetch(`/api/richiesta/stato`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stato: nuovoStato }),
    });

    if (res.ok) {
      setRichieste(prev =>
        prev.map(r => r.id === id ? { ...r, stato: nuovoStato as RichiestaAdmin['stato'] } : r)
      );

      await fetch('/api/notifiche/invia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utenteId,
          richiestaId: id,
          contenuto: `Lo stato della tua richiesta è ora "${nuovoStato.replace('_', ' ')}"`
        })
      });

      if (socket.connected) {
        socket.emit('notifica-stato', {
          richiestaId: id,
          contenuto: `Lo stato della tua richiesta è ora "${nuovoStato.replace('_', ' ')}"`
        });
      }
    } else {
      alert('Errore aggiornamento stato');
    }
  };

  const handleFileChange = (id: string, file: File | null) => {
    setFileMap(prev => ({ ...prev, [id]: file }));
  };

  const handleUpload = async (id: string, utenteId: string) => {
    const file = fileMap[id];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("richiestaId", id);

    const res = await fetch("/api/offerte", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setRichieste(prev =>
        prev.map(r => r.id === id ? { ...r, offerta: { fileUrl: updated.url, vista: false }, stato: "COMPLETATA" } : r)
      );
      setFileMap(prev => ({ ...prev, [id]: null }));

      await fetch('/api/notifiche/invia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utenteId,
          richiestaId: id,
          contenuto: "È stata caricata un'offerta per la tua richiesta."
        })
      });

      if (socket.connected) {
        socket.emit('notifica-offerta', {
          richiestaId: id,
          contenuto: "È stata caricata un'offerta per la tua richiesta."
        });
      }
    } else {
      alert("Errore nel caricamento dell'offerta");
    }
  };

  const handleDeletePdf = async (id: string, utenteId: string) => {
    if (!confirm("Sei sicuro di voler eliminare l'offerta?")) return;
    const res = await fetch(`/api/offerte?richiestaId=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRichieste(prev =>
        prev.map(r => r.id === id ? { ...r, offerta: null, stato: "IN_LAVORAZIONE" } : r)
      );

      await fetch('/api/notifiche/invia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utenteId,
          richiestaId: id,
          contenuto: "L'offerta per la tua richiesta è stata eliminata."
        })
      });

      if (socket.connected) {
        socket.emit('notifica-offerta', {
          richiestaId: id,
          contenuto: "L'offerta per la tua richiesta è stata eliminata."
        });
      }
    } else {
      alert("Errore nell'eliminazione del file");
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold text-[#C73A3A] mb-4">Gestione Richieste</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className="p-3 border-b">N.</th>
            <th className="p-3 border-b">Anno</th>
            <th className="p-3 border-b">Cliente</th>
            <th className="p-3 border-b">Email</th>
            <th className="p-3 border-b">Indirizzo</th>
            <th className="p-3 border-b">Stato</th>
            <th className="p-3 border-b">Offerta</th>
            <th className="p-3 border-b">Azioni</th>
            <th className="p-3 border-b">Carica Offerta</th>
          </tr>
        </thead>
        <tbody>
          {richieste.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-3">{r.numero}</td>
              <td className="p-3">{r.anno}</td>
              <td className="p-3">{r.utente?.name || "-"}</td>
              <td className="p-3">{r.utente.email}</td>
              <td className="p-3">{r.indirizzoSpedizione?.label}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {statoIcona[r.stato]}
                  <select
                    value={r.stato}
                    onChange={(e) => aggiornaStato(r.id, e.target.value, r.utente.id)}
                    className="bg-white border border-gray-300 text-sm rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C73A3A] focus:border-[#C73A3A] transition"
                  >
                    {statiDisponibili.map(stato => (
                      <option key={stato} value={stato}>{stato.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="p-3 relative">
                {r.offerta?.fileUrl ? (
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setShowMenu(showMenu === r.id ? null : r.id)}
                      className="text-green-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> PDF
                    </button>
                    {showMenu === r.id && (
                      <div className="absolute z-10 mt-1 w-32 bg-white border rounded shadow">
                        <button
                          onClick={() => {
                            window.open(r.offerta!.fileUrl, '_blank');
                            setShowMenu(null);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Apri
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(null);
                            handleDeletePdf(r.id, r.utente.id);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-3">
                <button
                  onClick={() => router.push(`/dashboard-admin/richiesta/${r.id}`)}
                  className="bg-[#C73A3A] text-white px-3 py-1 rounded text-xs hover:bg-[#a93232]"
                >
                  Gestisci
                </button>
              </td>
              <td className="p-3">
                <label
                  htmlFor={`file-${r.id}`}
                  className="cursor-pointer inline-block bg-[#C73A3A] text-white px-3 py-1 rounded text-xs hover:bg-[#a93232] mb-1"
                >
                  Scegli file
                </label>
                <input
                  id={`file-${r.id}`}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(r.id, e.target.files?.[0] || null)}
                  className="hidden"
                />
                {fileMap[r.id] && (
                  <button
                    onClick={() => handleUpload(r.id, r.utente.id)}
                    className="mt-1 block bg-[#C73A3A] text-white px-3 py-1 rounded text-xs hover:bg-[#a93232]"
                  >
                    Conferma caricamento
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}