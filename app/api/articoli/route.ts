// app/api/articoli/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const richiestaId = searchParams.get('richiestaId');

  if (!richiestaId) {
    return NextResponse.json({ error: 'Missing richiestaId' }, { status: 400 });
  }

  const articoli = await prisma.articoloRichiesta.findMany({
    where: { richiestaId: richiestaId, },
    include: {
     allegati: true,
    },
  });

  return NextResponse.json(articoli);
}