'use client';

import { useState } from 'react';

export default function NuovoArticoloForm({ richiestaId }: { richiestaId: string }) {
  const [testo, setTesto] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('richiestaId', richiestaId);
    formData.append('testo', testo);
    if (file) formData.append('file', file);

    const res = await fetch('/api/articoli/create', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Articolo aggiunto con successo');
      setTesto('');
      setFile(null);
    } else {
      alert('Errore durante il salvataggio');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={testo}
        onChange={(e) => setTesto(e.target.value)}
        placeholder="Descrizione"
        className="w-full border p-2"
        rows={3}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Salva Articolo
      </button>
    </form>
  );
}