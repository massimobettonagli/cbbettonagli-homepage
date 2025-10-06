'use client';

import { useEffect, useState } from 'react';

export default function PdfPreview({ richiestaId }: { richiestaId: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPdf() {
      try {
        setLoading(true);
        const response = await fetch(`/api/pdf/genera?id=${richiestaId}`);
        if (!response.ok) throw new Error('Errore nel recupero del PDF');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Errore anteprima PDF:', err);
      } finally {
        setLoading(false);
      }
    }

    if (richiestaId) fetchPdf();
  }, [richiestaId]);

  if (loading) return <p className="text-gray-600">Caricamento anteprima PDF...</p>;
  if (!pdfUrl) return <p className="text-red-600">Errore durante la generazione del PDF.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#C73A3A]">Anteprima PDF</h3>
      <iframe src={pdfUrl} width="100%" height="600px" className="border rounded shadow" />
      <a
        href={pdfUrl}
        download={`richiesta-${richiestaId}.pdf`}
        className="inline-block bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f] transition"
      >
        Scarica PDF
      </a>
    </div>
  );
}
