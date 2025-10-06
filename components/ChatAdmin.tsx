'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import socket from '@/lib/socket';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Utente {
  id: string;
  name: string;
  email: string;
}

interface Messaggio {
  id: string;
  contenuto: string;
  daAdmin: boolean;
  createdAt: string;
  letto: boolean;
}

interface Richiesta {
  id: string;
  numero: number;
  anno: number;
}

export default function ChatAdmin() {
  const { data: session, status } = useSession();

  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [richiesteUtente, setRichiesteUtente] = useState<Richiesta[]>([]);
  const [richiestaSelezionata, setRichiestaSelezionata] = useState<Richiesta | null>(null);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  const messaggiPrecedenti = useRef<Set<string>>(new Set());
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audio.current = new Audio('/notifica.mp3');
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.isAdmin) {
      fetch('/api/admin/utenti', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(setUtenti)
        .catch(err => console.error('Errore fetch utenti:', err));
    }
  }, [status, session]);

  useEffect(() => {
    if (!utenteSelezionato) return;

    fetch(`/api/admin/richieste?utenteId=${utenteSelezionato.id}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data) => {
        setRichiesteUtente(data);
        setRichiestaSelezionata(data[0] || null);
      });

    setMessaggi([]);
    messaggiPrecedenti.current.clear();
  }, [utenteSelezionato]);

  useEffect(() => {
    if (!richiestaSelezionata) return;

    const fetchMessaggi = async () => {
      const res = await fetch(`/api/admin/messaggi?richiestaId=${richiestaSelezionata.id}`, {
        credentials: 'include',
      });

      if (!res.ok) return;

      const data: Messaggio[] = await res.json();
      data.forEach(m => messaggiPrecedenti.current.add(m.id));
      setMessaggi(data);
    };

    fetchMessaggi();
    const interval = setInterval(fetchMessaggi, 5000);
    return () => clearInterval(interval);
  }, [richiestaSelezionata]);

  useEffect(() => {
    if (!richiestaSelezionata) return;

    // ✅ Join stanza
    socket.emit('join-room', richiestaSelezionata.id);

    const handler = (msg: Messaggio) => {
      if (!messaggiPrecedenti.current.has(msg.id)) {
        messaggiPrecedenti.current.add(msg.id);
        setMessaggi(prev => [...prev, msg]);

        if (!msg.daAdmin && audio.current) {
          audio.current.play().catch(err => console.warn('Errore suono:', err));
        }
      }
    };

    socket.on('message-received', handler);

    // ✅ Cleanup corretto: uscita dalla stanza + rimozione handler
    return () => {
      socket.emit('leave-room', richiestaSelezionata.id);
      socket.off('message-received', handler);
    };
  }, [richiestaSelezionata]);

  const inviaMessaggio = async () => {
    if (!nuovoMessaggio.trim() || !utenteSelezionato || !richiestaSelezionata) return;

    const res = await fetch('/api/admin/messaggi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        contenuto: nuovoMessaggio,
        utenteId: utenteSelezionato.id,
        richiestaId: richiestaSelezionata.id,
      }),
    });

    if (res.ok) {
      const msg = await res.json();

      // ✅ Invio evento socket
      socket.emit('new-message', {
        richiestaId: richiestaSelezionata.id,
        messaggio: {
          ...msg,
          daAdmin: true,
          utenteId: utenteSelezionato.id,
        },
      });

      messaggiPrecedenti.current.add(msg.id);
      setMessaggi(prev => [...prev, msg]);
      setNuovoMessaggio('');
    } else {
      alert('Errore nell’invio del messaggio');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white rounded-xl shadow overflow-hidden">
      {/* Sidebar utenti */}
      <aside className="w-64 bg-[#C73A3A] text-white p-4 space-y-2 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Utenti</h2>
        {utenti.map((utente) => (
          <button
            key={utente.id}
            className={cn(
              'flex items-center w-full px-3 py-2 rounded-lg text-left hover:bg-[#a83232]',
              utenteSelezionato?.id === utente.id && 'bg-white text-[#C73A3A] font-semibold'
            )}
            onClick={() => setUtenteSelezionato(utente)}
          >
            <User className="w-5 h-5 mr-2" />
            {utente.name || utente.email}
          </button>
        ))}
      </aside>

      {/* Area chat */}
      <main className="flex-1 flex flex-col">
        <div className="border-b px-6 py-3 font-semibold text-[#C73A3A] flex justify-between items-center">
          {utenteSelezionato ? (
            <>
              <span>{utenteSelezionato.name || utenteSelezionato.email}</span>
              <select
                value={richiestaSelezionata?.id || ''}
                onChange={(e) => {
                  const selected = richiesteUtente.find(r => r.id === e.target.value);
                  setRichiestaSelezionata(selected || null);
                }}
                className="border px-2 py-1 rounded"
              >
                <option value="">Seleziona richiesta</option>
                {richiesteUtente.map((r) => (
                  <option key={r.id} value={r.id}>
                    Richiesta {r.numero}/{r.anno}
                  </option>
                ))}
              </select>
            </>
          ) : (
            'Seleziona un utente'
          )}
        </div>

        {/* Messaggi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messaggi.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-xs px-4 py-2 rounded-lg text-sm',
                msg.daAdmin
                  ? 'ml-auto bg-[#C73A3A] text-white'
                  : cn('bg-white border', !msg.letto && 'border-[#C73A3A] border-2')
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

        {/* Input messaggi */}
        {utenteSelezionato && richiestaSelezionata && (
          <div className="border-t p-4 flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Scrivi un messaggio..."
              value={nuovoMessaggio}
              onChange={(e) => setNuovoMessaggio(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && inviaMessaggio()}
            />
            <button
              onClick={inviaMessaggio}
              className="bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f]"
            >
              Invia
            </button>
          </div>
        )}
      </main>
    </div>
  );
}