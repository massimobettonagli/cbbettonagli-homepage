// /app/api/messaggi/utenti/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  // recupera l'utente loggato
  const utente = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!utente) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
  }

  let utenti;

  if (utente.isAdmin) {
    // 👑 Admin: può vedere tutti gli utenti
    utenti = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  } else {
    // 👤 Utente normale: mostra solo chi ha messaggi (legati a lui)
    utenti = await prisma.user.findMany({
      where: {
        messaggi: { some: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  return NextResponse.json(utenti);
}