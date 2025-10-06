"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import socket from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Notifica {
  notificaId: string;
  messaggioId?: string;
  contenuto: string;
  letto: boolean;
  richiestaId: string;
  createdAt: string;
  tipo?: "chat" | "generica";
}

export interface NotificheCampanellaProps {
  onClick?: () => void;
}

export default function NotificheCampanella({ onClick }: NotificheCampanellaProps) {
  const { data: session } = useSession();
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [aperto, setAperto] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const notificheNonLette = notifiche.filter((n) => !n.letto);

  // 🔹 Join stanza utente
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleJoin = () => {
      socket.emit("join-room", session.user.id);
    };

    if (socket.connected) {
      handleJoin();
    } else {
      socket.once("connect", handleJoin);
    }

    return () => {
      socket.off("connect", handleJoin);
    };
  }, [session?.user?.id]);

  // 🔹 Chiudi menu se clic fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setAperto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Notifica da chat
  useEffect(() => {
    const handler = (msg: any) => {
      const nuovaNotifica: Notifica = {
        notificaId: msg.id || crypto.randomUUID(),
        messaggioId: msg.messaggioId || msg.id || "",
        contenuto: msg.contenuto,
        letto: false,
        richiestaId: msg.richiestaId,
        createdAt: msg.createdAt || new Date().toISOString(),
        tipo: "chat",
      };

      setNotifiche((prev) => {
        const exists = prev.some((n) => n.notificaId === nuovaNotifica.notificaId);
        if (exists) return prev;
        return [...prev, nuovaNotifica];
      });

      if (document.visibilityState === "visible") {
        const audio = new Audio("/notifica.mp3");
        audio.play().catch(() => {});
      }
    };

    socket.on("notifica-utente", handler);
    return () => {
      socket.off("notifica-utente", handler);
    };
  }, []);

  // 🔹 Notifica da eventi generici
  useEffect(() => {
    const handler = ({ contenuto, tipo, richiestaId }: any) => {
      const nuovaNotifica: Notifica = {
        notificaId: crypto.randomUUID(),
        contenuto,
        letto: false,
        richiestaId: richiestaId || "generica",
        createdAt: new Date().toISOString(),
        tipo: "generica",
      };

      setNotifiche((prev) => [...prev, nuovaNotifica]);

      if (document.visibilityState === "visible") {
        const audio = new Audio("/notifica.mp3");
        audio.play().catch(() => {});
      }
    };

    socket.on("notifica-generica", handler);
    return () => {
      socket.off("notifica-generica", handler);
    };
  }, []);

  const handleApriNotifiche = () => {
    if (onClick) {
      // 👉 se viene passato un onClick esterno (es. aprire sezione messaggi)
      onClick();
    } else {
      // 👉 comportamento di default: apre/chiude dropdown notifiche
      setAperto(!aperto);
      setNotifiche((prev) => prev.map((n) => ({ ...n, letto: true })));
    }
  };

  const gestisciClickNotifica = (notifica: Notifica) => {
    setAperto(false);
    if (notifica.tipo === "chat") {
      router.push(`/dashboard?richiesta=${notifica.richiestaId}&messaggio=${notifica.messaggioId}#messaggi`);
    } else {
      router.push(`/dashboard?richiesta=${notifica.richiestaId}`);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <audio ref={audioRef} src="/notifica.mp3" preload="auto" />
      <button onClick={handleApriNotifiche} className="relative">
        <Bell
          className={cn(
            "w-6 h-6 text-[#C73A3A] transition-transform",
            notificheNonLette.length > 0 && "animate-bounce"
          )}
        />
        {notificheNonLette.length > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
        )}
      </button>

      {/* Dropdown notifiche solo se non uso onClick esterno */}
      {!onClick && aperto && (
        <div className="absolute left-0 mt-2 w-72 bg-white border shadow-lg rounded-lg z-50">
          <div className="p-2 font-semibold border-b">Notifiche</div>
          <ul className="max-h-60 overflow-y-auto">
            {notifiche.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">Nessuna notifica</li>
            ) : (
              notifiche
                .slice()
                .reverse()
                .map((n) => (
                  <li
                    key={`${n.richiestaId}-${n.notificaId}`}
                    onClick={() => gestisciClickNotifica(n)}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 transition",
                      !n.letto && "font-semibold"
                    )}
                  >
                    📩 {n.contenuto}
                    <div className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}