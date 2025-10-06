'use client';

import { useEffect } from 'react';
import socket from '@/lib/socket';

export default function InitSocket() {
  useEffect(() => {
    let tentativi = 0;
    const maxTentativi = 10;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/socket');
        if (res.ok) {
          console.log('✅ Socket.IO inizializzato dal client');
          socket.connect(); // Connessione manuale
          clearInterval(interval);
        } else {
          console.warn(`⚠️ Tentativo ${tentativi + 1}: Socket.IO non inizializzato (status: ${res.status})`);
        }
      } catch (err) {
        console.warn(`❌ Errore tentativo ${tentativi + 1}:`, err);
      }

      tentativi++;
      if (tentativi >= maxTentativi) {
        console.error('❌ Errore: superato numero massimo di tentativi per inizializzare il socket');
        clearInterval(interval);
      }
    }, 3000); // Ogni 3 secondi

    return () => clearInterval(interval);
  }, []);

  return null;
}