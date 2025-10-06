'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Articolo {
  testo: string;
  immagini: string[]; // URL o base64 se disponibile
}

interface RichiestaDettagli {
  id: string;
  numero: number;
  anno: number;
  articoli: Articolo[];
}

export default function PopupRichiestaDettagli({
  richiestaId,
  onClose,
}: {
  richiestaId: string;
  onClose: () => void;
}) {
  const [richiesta, setRichiesta] = useState<RichiestaDettagli | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDettagli() {
      const res = await fetch(`/api/richieste/${richiestaId}`);
      if (res.ok) {
        const data = await res.json();
        setRichiesta(data);
      }
    }
    fetchDettagli();
  }, [richiestaId]);

  if (!richiesta) return null;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6">
        <Dialog.Title className="text-xl font-semibold mb-4 text-[#C73A3A]">
          Dettagli richiesta n. {richiesta.numero}/{richiesta.anno}
        </Dialog.Title>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Descrizione</th>
                <th className="p-2 border">Allegati</th>
                <th className="p-2 border text-center">Azione</th>
              </tr>
            </thead>
            <tbody>
              {richiesta.articoli.map((articolo, idx) => (
                <tr key={idx} className="border hover:bg-gray-50 transition">
                  <td className="p-2 border text-center">{idx + 1}</td>
                  <td className="p-2 border">{articolo.testo}</td>
                  <td className="p-2 border space-x-1">
                    {articolo.immagini.map((img, i) => (
                      <div
                        key={i}
                        className="inline-block relative w-10 h-10 border rounded overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt={`allegato-${i}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/modifica-richiesta/${richiesta.id}`)
                      }
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Procedi alla modifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Chiudi
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
