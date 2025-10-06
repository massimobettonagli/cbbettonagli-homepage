'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import socket from '@/lib/socket';
import { useSearchParams } from 'next/navigation';

interface Richiesta {
  id: string;
  numero: number;
  anno: number;
}

interface Messaggio {
  id: string;
  contenuto: string;
  daAdmin: boolean;
  createdAt: string;
  richiestaId: string;
  letto?: boolean;
}

export default function ChatUtente() {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [richiestaSelezionata, setRichiestaSelezionata] = useState<Richiesta | null>(null);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const [inviando, setInviando] = useState(false);
  const [notificaVisiva, setNotificaVisiva] = useState(false);

  const messaggiSet = useRef<Set<string>>(new Set());
  const messaggiRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const audio = useRef<HTMLAudioElement | null>(null);

  const searchParams = useSearchParams();
  const messaggioTarget = searchParams?.get('messaggio') ?? null;
  const richiestaParam = searchParams?.get('richiesta') ?? null;

  useEffect(() => {
    audio.current = new Audio('/notifica.mp3');
  }, []);

  // Carica richieste e seleziona quella da URL
  useEffect(() => {
    fetch('/api/user/richieste')
      .then(res => res.json())
      .then(data => {
        setRichieste(data);
        const selezionata = data.find((r: Richiesta) => r.id === richiestaParam) || data[0];
        setRichiestaSelezionata(selezionata || null);
      });
  }, [richiestaParam]);

  // Carica messaggi ogni volta che cambia richiesta o target
  const richiestaId = richiestaSelezionata?.id;

  useEffect(() => {
    if (!richiestaId) return;

    fetch(`/api/user/messaggi?richiestaId=${richiestaId}`)
      .then(res => res.json())
      .then(data => {
        messaggiSet.current.clear();
        data.forEach((m: Messaggio) => messaggiSet.current.add(m.id));
        setMessaggi(data);
        socket.emit('join-room', richiestaId);
        setNotificaVisiva(false);
      });
  }, [richiestaId, messaggioTarget]);

  // Ricezione messaggi via socket ✅ fix cleanup
  useEffect(() => {
    const handler = (messaggio: Messaggio) => {
      if (messaggio.richiestaId === richiestaSelezionata?.id && !messaggiSet.current.has(messaggio.id)) {
        messaggiSet.current.add(messaggio.id);
        setMessaggi(prev => [...prev, messaggio]);

        if (messaggio.daAdmin && audio.current) {
          audio.current.play().catch(console.warn);
          setNotificaVisiva(true);
        }
      }
    };

    socket.on('message-received', handler);

    return () => {
      socket.off('message-received', handler);
    };
  }, [richiestaSelezionata?.id]);

  // Scrolla e anima il messaggio target
  useEffect(() => {
    if (messaggioTarget && messaggiRefs.current.has(messaggioTarget)) {
      const el = messaggiRefs.current.get(messaggioTarget);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('animate-pulse', 'ring', 'ring-[#C73A3A]', 'ring-offset-2');

        setTimeout(() => {
          el?.classList.remove('animate-pulse', 'ring', 'ring-[#C73A3A]', 'ring-offset-2');
        }, 2500);
      }
    }
  }, [messaggi, messaggioTarget]);

  const inviaMessaggio = async () => {
    if (inviando || !nuovoMessaggio.trim() || !richiestaId) return;

    setInviando(true);
    try {
      const res = await fetch('/api/user/messaggi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenuto: nuovoMessaggio, richiestaId }),
      });

      if (res.ok) {
        const msg = await res.json();
        messaggiSet.current.add(msg.id);
        setMessaggi(prev => [...prev, msg]);
        socket.emit('new-message', { richiestaId, messaggio: msg });
        setNuovoMessaggio('');
      } else {
        alert("Errore durante l'invio");
      }
    } finally {
      setInviando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col relative">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona richiesta:</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={richiestaId || ''}
          onChange={(e) => {
            const selected = richieste.find(r => r.id === e.target.value);
            setRichiestaSelezionata(selected || null);
          }}
        >
          {richieste.map((r) => (
            <option key={r.id} value={r.id}>
              Richiesta {r.numero}/{r.anno}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded relative" id="messaggi">
        {notificaVisiva && (
          <div className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded shadow animate-pulse z-10">
            Nuovo messaggio!
          </div>
        )}

        {messaggi.map((msg) => (
          <div
            key={`msg-${msg.id}`}
            ref={(el) => {
              messaggiRefs.current.set(msg.id, el);
            }}
            className={cn(
              'max-w-xs px-4 py-2 rounded-lg text-sm transition-all duration-300',
              msg.daAdmin ? 'bg-gray-200' : 'ml-auto bg-[#C73A3A] text-white'
            )}
          >
            {msg.contenuto}
            <div className="text-[10px] text-right text-gray-400 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Scrivi un messaggio..."
          value={nuovoMessaggio}
          onChange={(e) => setNuovoMessaggio(e.target.value)}
          onFocus={() => setNotificaVisiva(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              inviaMessaggio();
            }
          }}
        />
        <button
          onClick={inviaMessaggio}
          disabled={inviando}
          className="bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f] disabled:opacity-50"
        >
          Invia
        </button>
      </div>
    </div>
  );
}