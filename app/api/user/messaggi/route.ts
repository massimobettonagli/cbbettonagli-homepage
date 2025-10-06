// /app/api/user/messaggi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const richiestaId = searchParams.get('richiestaId');

  if (!richiestaId) {
    return NextResponse.json({ error: 'richiestaId mancante' }, { status: 400 });
  }

  try {
    const messaggi = await prisma.messaggio.findMany({
      where: { richiestaId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messaggi);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { contenuto, richiestaId } = body;

    if (!contenuto || !richiestaId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const nuovoMessaggio = await prisma.messaggio.create({
      data: {
        contenuto,
        richiestaId,
        utenteId: user.id,
        daAdmin: false,
      },
    });

    return NextResponse.json(nuovoMessaggio);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}