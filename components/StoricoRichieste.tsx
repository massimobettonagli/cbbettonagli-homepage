'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Loader,
  Loader2,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import ArticoliRichiestaModal from './ArticoliRichiestaModal';

/* =======================
   Tipi
======================= */
interface Offerta {
  fileUrl: string;
  vista: boolean;
}

interface Richiesta {
  id: string;
  numero: number;
  anno: number;
  stato: 'INVIATA' | 'IN_LAVORAZIONE' | 'COMPLETATA';
  createdAt: string;
  indirizzoSpedizione: { label: string };
  offerta?: Offerta;
}

/* =======================
   Celle UI riutilizzabili
======================= */
function DownloadOffertaCell({
  richiestaId,
  fileUrl,
  vista,
  onAfterOpen,
}: {
  richiestaId: string;
  fileUrl?: string;
  vista?: boolean;
  onAfterOpen: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!fileUrl || loading) return;
    try {
      setLoading(true);
      // segna come vista (fire-and-forget)
      fetch('/api/offerta/vista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ richiestaId }),
      }).catch(() => {});

      // apri la route API che serve il PDF con headers corretti
      window.open(`/api/offerta/${richiestaId}`, '_blank');
      onAfterOpen();
    } finally {
      setLoading(false);
    }
  };

  if (!fileUrl) {
    return (
      <div className="inline-flex items-center gap-2 text-gray-400">
        <FileText className="w-4 h-4" />
        <span className="text-xs">Nessuna offerta</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Stato pill */}
      <span
        className={[
          'px-2 py-0.5 rounded-full text-[11px] font-medium',
          vista
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200',
        ].join(' ')}
        title={vista ? "L'offerta è già stata aperta" : 'Nuova offerta non ancora vista'}
      >
        {vista ? 'Vista' : 'Non vista'}
      </span>

      {/* Bottone principale */}
      <button
        onClick={handleOpen}
        disabled={loading}
        className={[
          'relative inline-flex items-center gap-2',
          'rounded-lg border px-3 py-1.5 text-sm font-semibold',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          'border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:ring-[#C73A3A]',
        ].join(' ')}
        aria-label="Apri/Scarica offerta"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>{loading ? 'Apro…' : 'Apri offerta'}</span>

        {!vista && !loading && (
          <span className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white text-[10px] px-1.5 py-0.5 shadow">
            NUOVA
          </span>
        )}
      </button>

      {/* Azione secondaria con tooltip (stesso handler) */}
      <div className="relative group">
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
        >
          <Eye className="w-3.5 h-3.5" />
          Anteprima
        </button>
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          Apri l’offerta in una nuova scheda
        </div>
      </div>
    </div>
  );
}

/* =======================
   Pagina
======================= */
export default function StoricoRichieste() {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRichiestaId, setSelectedRichiestaId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Richiesta | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRichieste() {
      const res = await fetch('/api/user/richieste', { cache: 'no-store' });
      const data = await res.json();
      setRichieste(data);
    }
    fetchRichieste();
  }, []);

  const statoIcona = {
    INVIATA: <Clock className="text-yellow-500 w-5 h-5" />,
    IN_LAVORAZIONE: <Loader className="text-blue-500 w-5 h-5 animate-spin" />,
    COMPLETATA: <CheckCircle className="text-green-600 w-5 h-5" />,
  };

  const richiesteFiltrate = richieste.filter((r) =>
    `${r.numero}/${r.anno}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const compareValues = (a: Richiesta, b: Richiesta, col: keyof Richiesta) => {
    // gestione colonne complesse
    if (col === 'indirizzoSpedizione') {
      const A = a.indirizzoSpedizione?.label || '';
      const B = b.indirizzoSpedizione?.label || '';
      return A.localeCompare(B, 'it');
    }
    if (col === 'offerta') {
      const A = a.offerta ? (a.offerta.vista ? 1 : 0) : -1;
      const B = b.offerta ? (b.offerta.vista ? 1 : 0) : -1;
      return A - B;
    }
    const va = a[col] as unknown as string | number | Date;
    const vb = b[col] as unknown as string | number | Date;

    // date string
    if (col === 'createdAt') {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return da - db;
    }

    if (typeof va === 'number' && typeof vb === 'number') return va - vb;
    return String(va ?? '').localeCompare(String(vb ?? ''), 'it');
  };

  const richiesteOrdinabili = sortColumn
    ? [...richiesteFiltrate].sort((a, b) =>
        sortAsc ? compareValues(a, b, sortColumn) : compareValues(b, a, sortColumn)
      )
    : richiesteFiltrate;

  const toggleSort = (col: keyof Richiesta) => {
    if (sortColumn === col) {
      setSortAsc((s) => !s);
    } else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  const handleElimina = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa richiesta?')) return;
    const res = await fetch(`/api/richiesta/delete?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRichieste((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Errore durante l'eliminazione");
    }
  };

  const renderSortHeader = (label: string, col: keyof Richiesta) => (
    <th className="p-3 border-b cursor-pointer select-none" onClick={() => toggleSort(col)}>
      <span className="inline-flex items-center gap-1.5">
        {label}
        {sortColumn === col &&
          (sortAsc ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
      </span>
    </th>
  );

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold text-[#C73A3A]">Storico richieste</h2>

      <input
        type="text"
        placeholder="Cerca per numero/anno..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-4 text-sm"
      />

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              {renderSortHeader('Numero', 'numero')}
              {renderSortHeader('Anno', 'anno')}
              {renderSortHeader('Data', 'createdAt')}
              {renderSortHeader('Indirizzo', 'indirizzoSpedizione')}
              {renderSortHeader('Stato', 'stato')}
              <th className="p-3 border-b">Azioni</th>
              {renderSortHeader('Offerta (PDF)', 'offerta')}
            </tr>
          </thead>
          <tbody>
            {richiesteOrdinabili.map((r) => {
              const parsedDate = new Date(r.createdAt);
              const formattedDate = isNaN(parsedDate.getTime())
                ? 'Data non valida'
                : parsedDate.toLocaleDateString('it-IT');

              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.numero}</td>
                  <td className="p-3">{r.anno}</td>
                  <td className="p-3">{formattedDate}</td>
                  <td className="p-3">{r.indirizzoSpedizione?.label || '-'}</td>
                  <td className="p-3">{statoIcona[r.stato]}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedRichiestaId(r.id);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifica"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleElimina(r.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Elimina"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <DownloadOffertaCell
                      richiestaId={r.id}
                      fileUrl={r.offerta?.fileUrl}
                      vista={r.offerta?.vista}
                      onAfterOpen={() => {
                        // aggiorna lo stato locale a “vista”
                        setRichieste((prev) =>
                          prev.map((req) =>
                            req.id === r.id && req.offerta
                              ? { ...req, offerta: { ...req.offerta, vista: true } }
                              : req
                          )
                        );
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRichiestaId && (
        <ArticoliRichiestaModal
          richiestaId={selectedRichiestaId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}