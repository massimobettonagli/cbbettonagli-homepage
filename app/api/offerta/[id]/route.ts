import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // Recupera dal DB l'offerta associata alla richiesta
  const offerta = await prisma.offerta.findUnique({
    where: { richiestaId: params.id },
  });

  // Se non esiste, 404
  if (!offerta || !offerta.fileUrl) {
    return NextResponse.json({ error: 'Offerta non trovata' }, { status: 404 });
  }

  // Percorso assoluto al file nella cartella public
  const filePath = path.join(process.cwd(), 'public', offerta.fileUrl);

  try {
    // Legge il file come buffer
    const fileBuffer = await fs.readFile(filePath);

    // Converte in Blob compatibile con NextResponse
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    // Restituisce il PDF come risposta
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=offerta_${params.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Errore nel recupero del file:', error);
    return NextResponse.json({ error: 'Errore nel recupero del file' }, { status: 500 });
  }
}