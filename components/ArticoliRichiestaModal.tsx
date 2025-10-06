'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Allegato {
  id: string;
  url: string;
}

interface Articolo {
  id: string;
  testo: string;
  richiestaId: string;
  allegati: Allegato[];
}

interface ArticoliRichiestaModalProps {
  richiestaId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticoliRichiestaModal({ richiestaId, isOpen, onClose }: ArticoliRichiestaModalProps) {
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/articoli?richiestaId=${richiestaId}`)
        .then(res => res.json())
        .then(data => setArticoli(data));
    }
  }, [isOpen, richiestaId]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />

      <div className="relative bg-white p-6 rounded-lg w-full max-w-4xl shadow-lg z-50 overflow-y-auto max-h-[90vh]">
        <Dialog.Title className="text-lg font-semibold mb-4">Dettaglio Articoli della Richiesta</Dialog.Title>

        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Descrizione</th>
              <th className="p-2 border">Allegati</th>
              <th className="p-2 border">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {articoli.map((articolo) => (
              <tr key={articolo.id} className="align-top">
                <td className="p-2 border w-1/3">{articolo.testo}</td>
                <td className="p-2 border flex flex-wrap gap-2">
                  {articolo.allegati?.map(img => (
                    <Image
                      key={img.id}
                      src={img.url}
                      alt="img"
                      width={60}
                      height={60}
                      className="rounded border"
                    />
                  ))}
                </td>
               <td className="p-2 border">
  <button
    className="bg-[#C73A3A] text-white px-3 py-1 rounded text-xs hover:bg-[#a93232]"
    onClick={() => router.push(`/dashboard/modifica-articolo/${articolo.id}`)}
  >
    Procedi con la modifica
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-gray-600 hover:underline">
            Chiudi
          </button>
        </div>
      </div>
    </Dialog>
  );
}