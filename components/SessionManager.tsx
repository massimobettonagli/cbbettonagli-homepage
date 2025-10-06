'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export default function SessionManager() {
  const { data: session, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session || !session.expires) return;

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    const remainingTime = expiresAt - now;

    // Mostra il popup 30 secondi prima della scadenza
    const popupDelay = remainingTime - 30_000;
    const logoutDelay = remainingTime;

    if (popupDelay > 0) {
      setShowModal(false);
      timeoutRef.current = setTimeout(() => setShowModal(true), popupDelay);
    }

    // Auto logout dopo la scadenza
    const logoutTimeout = setTimeout(() => {
      setShowModal(false);
      signOut({ callbackUrl: '/login' });
    }, logoutDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(logoutTimeout);
    };
  }, [session]);

  const estendiSessione = async () => {
    await update(); // Richiama il server per aggiornare la sessione
    setShowModal(false);
  };

  return showModal ? (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
        <p className="text-lg mb-4 text-gray-800">La tua sessione sta per scadere.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={estendiSessione}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Estendi sessione
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              signOut({ callbackUrl: '/login' });
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Esci ora
          </button>
        </div>
      </div>
    </div>
  ) : null;
}