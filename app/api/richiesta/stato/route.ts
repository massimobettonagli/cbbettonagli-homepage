import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { inviaNotificaUtente } from '@/lib/notifiche';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  const { id, stato } = await req.json();

  if (!id || !stato) {
    return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
  }

  try {
    // Recupera la richiesta con i dati utente
    const richiesta = await prisma.richiesta.update({
      where: { id },
      data: { stato },
      include: {
        utente: true,
      },
    });

    // Invia la notifica all'utente
    if (richiesta.utente?.id) {
      inviaNotificaUtente({
        utenteId: richiesta.utente.id,
        richiestaId: richiesta.id,
        contenuto: `Lo stato della tua richiesta è stato aggiornato a "${stato.replace('_', ' ')}".`,
      });
    }

    return NextResponse.json(richiesta);
  } catch (err) {
    console.error('Errore aggiornamento stato:', err);
    return NextResponse.json({ error: 'Errore aggiornamento stato' }, { status: 500 });
  }
}