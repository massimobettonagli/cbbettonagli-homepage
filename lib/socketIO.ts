import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function setIO(serverInstance: IOServer) {
  if (!io) {
    io = serverInstance;

    io.on('connection', (socket) => {
      console.log('✅ Nuovo client connesso');

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`👥 Utente con ID ${socket.id} entrato nella stanza: ${roomId}`);

        // ✅ Controllo che 'io' sia definito prima di accedere
        if (io) {
          const stanze = Array.from(io.sockets.adapter.rooms.keys());
          console.log('🧪 Stanze attive:', stanze);
        }
      });

      socket.on('new-message', ({ richiestaId, messaggio }) => {
        io?.to(richiestaId).emit('message-received', messaggio);

        if (messaggio.daAdmin && messaggio.utenteId) {
          io?.to(messaggio.utenteId).emit('notifica-utente', {
            richiestaId,
            contenuto: messaggio.contenuto,
            id: messaggio.id,
            createdAt: messaggio.createdAt,
            daAdmin: true,
          });
        }
      });

      socket.on('notifica-stato', ({ richiestaId, contenuto }) => {
        io?.to(richiestaId).emit('notifica-generica', { contenuto, tipo: 'stato' });
      });

      socket.on('notifica-offerta', ({ richiestaId, contenuto }) => {
        io?.to(richiestaId).emit('notifica-generica', { contenuto, tipo: 'offerta' });
      });
    });

    console.log('✅ Socket.IO inizializzato');
  }
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error('❌ Socket.IO non inizializzato. Chiama /api/socket almeno una volta dal frontend.');
  }
  return io;
}