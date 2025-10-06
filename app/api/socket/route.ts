// app/api/socket/route.ts
import { NextRequest } from 'next/server';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { setIO } from '@/lib/socketIO';


export async function GET(req: NextRequest) {
  const server: any = (globalThis as any).server;

  if (!server?.io) {
    const httpServer: HTTPServer = (req as any).socket?.server;
    const io = new IOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    setIO(io);
    (globalThis as any).server = { io };
    console.log('✅ Socket.IO inizializzato');
  }

  return new Response('Socket.IO ready', { status: 200 });
}
