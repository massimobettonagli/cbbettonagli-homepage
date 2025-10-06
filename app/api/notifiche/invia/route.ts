// app/api/notifiche/invia/route.ts
import { NextResponse } from 'next/server';
import { inviaNotificaUtente } from '@/lib/notifiche';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { utenteId, richiestaId, contenuto } = body;

    if (!utenteId || !richiestaId || !contenuto) {
      return NextResponse.json({ error: 'Dati richiesti: utenteId, richiestaId, contenuto' }, { status: 400 });
    }

    inviaNotificaUtente({ utenteId, richiestaId, contenuto });

    return NextResponse.json({ success: true, message: 'Notifica inviata con successo' });
  } catch (error) {
    console.error('❌ Errore invio notifica:', error);
    return NextResponse.json({ error: 'Errore interno durante l\'invio della notifica' }, { status: 500 });
  }
}