'use client';

import { useState } from 'react';

export default function UploadOfferta({
  richiestaId,
  onUploadSuccess,
}: {
  richiestaId: string;
  onUploadSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('richiestaId', richiestaId);

    const res = await fetch('/api/offerte', {
      method: 'POST',
      body: formData,
    });

    setIsUploading(false);

    if (res.ok) {
      alert('Offerta caricata con successo');
      setFile(null);
      onUploadSuccess?.(); // ⚡️ richiama il refresh
    } else {
      alert('Errore nel caricamento');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        type="submit"
        className="bg-[#C73A3A] text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || isUploading}
      >
        {isUploading ? 'Caricamento...' : 'Carica offerta'}
      </button>
    </form>
  );
}