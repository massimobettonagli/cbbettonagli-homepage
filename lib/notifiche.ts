import { getIO, setIO } from '@/lib/socketIO';
import { v4 as uuid } from 'uuid';
import { Server as IOServer } from 'socket.io';
import { createServer } from 'http';

interface NotificaParams {
  utenteId: string;
  richiestaId: string;
  contenuto: string;
}

let fallbackInizializzato = false;

export async function inviaNotificaUtente({ utenteId, richiestaId, contenuto }: NotificaParams) {
  try {
    let io: IOServer;

    try {
      io = getIO();
    } catch {
      if (!fallbackInizializzato) {
        const server = createServer();
        const { Server } = await import('socket.io');
        const ioServer = new Server(server);
        setIO(ioServer);
        fallbackInizializzato = true;
        console.warn('⚠️ Socket.IO forzatamente inizializzato in fallback');
        io = getIO();
      } else {
        throw new Error('Socket.IO ancora non disponibile');
      }
    }

    const id = uuid();

    const notifica = {
      id,
      richiestaId,
      contenuto,
      createdAt: new Date().toISOString(),
      daAdmin: true,
    };

    io.to(utenteId).emit('notifica-utente', notifica);
    console.log(`🔔 Notifica inviata a utente ${utenteId}: ${contenuto}`);
  } catch (error) {
    console.error('❌ Errore durante l’invio della notifica:', error);
  }
}