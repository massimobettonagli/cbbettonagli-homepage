import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const articoli = await prisma.articoloRichiesta.findMany({
    where: { richiestaId: params.id },
    include: { allegati: true },
  });

  return NextResponse.json(articoli);
}