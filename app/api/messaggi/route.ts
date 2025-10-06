// /app/api/messaggi/route.ts
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

    return NextResponse.json(messaggi);
  } catch {
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}