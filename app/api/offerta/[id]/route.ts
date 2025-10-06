import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const offerta = await prisma.offerta.findUnique({
    where: { richiestaId: params.id },
  });

  if (!offerta || !offerta.fileUrl) {
    return NextResponse.json({ error: 'Offerta non trovata' }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', offerta.fileUrl);

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=offerta_${params.id}.pdf`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero del file' }, { status: 500 });
  }
}