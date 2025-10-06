// app/api/offerta/vista/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const body = await req.json();
  const richiestaId = body.richiestaId;

  if (!richiestaId) {
    return NextResponse.json({ error: 'ID richiesta mancante' }, { status: 400 });
  }

  try {
    const offerta = await prisma.offerta.update({
      where: { richiestaId },
      data: { vista: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errore aggiornamento vista offerta:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
