import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    await prisma.messaggio.updateMany({
      where: {
        richiestaId,
        daAdmin: false,
        letto: false,
      },
      data: {
        letto: true,
      },
    });

    return NextResponse.json(messaggi);
  } catch (error) {
    console.error('Errore GET /messaggi:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contenuto, utenteId, richiestaId } = body;

    if (!contenuto || !utenteId || !richiestaId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const nuovoMessaggio = await prisma.messaggio.create({
      data: {
        contenuto,
        utenteId,
        richiestaId,
        daAdmin: true,
        letto: false,
      },
    });

    // ❌ NON usare getIO qui, fallo nel client
    return NextResponse.json(nuovoMessaggio);
  } catch (error) {
    console.error('Errore POST /messaggi:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}