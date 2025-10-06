'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Allegato {
  id: string;
  url: string;
}

interface ArticoloRichiesta {
  id: string;
  testo: string;
  allegati: Allegato[];
}

export default function ModificaRichiestaForm({ articolo }: { articolo: ArticoloRichiesta }) {
  const router = useRouter();
  const [testo, setTesto] = useState(() => articolo?.testo || '');
  const [immagini, setImmagini] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImmagini([...immagini, ...Array.from(e.target.files)]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImmagini((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('testo', testo);
    immagini.forEach((file, i) => {
      formData.append(`file-${i}`, file);
    });

    const res = await fetch(`/api/articoli/${articolo.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Errore durante la modifica dell’articolo');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl shadow"
    >
      <h2 className="text-xl font-semibold text-[#C73A3A]">Modifica articolo</h2>

      {/* Campo descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrizione
        </label>
        <textarea
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          rows={4}
          className="mt-1 block w-full border rounded-md p-2 text-sm focus:ring-[#C73A3A] focus:border-[#C73A3A]"
        />
      </div>

      {/* Upload immagini */}
      <div>
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          📁 Scegli immagini
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Anteprime */}
        <div className="mt-4 flex flex-wrap gap-4">
          {immagini.map((file, i) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={i}
                className="relative w-24 h-24 border rounded-md overflow-hidden"
              >
                <Image
                  src={previewUrl}
                  alt={`anteprima-${i}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(i)}
                  className="absolute top-0 right-0 bg-white bg-opacity-80 p-1 rounded-bl"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottoni */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a93232] transition"
        >
          Salva modifiche
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}