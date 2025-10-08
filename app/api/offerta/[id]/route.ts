import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const offerta = await prisma.offerta.findUnique({
    where: { richiestaId: params.id },
  });

  if (!offerta || !offerta.fileUrl) {
    return new Response(JSON.stringify({ error: 'Offerta non trovata' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const filePath = path.join(process.cwd(), 'public', offerta.fileUrl);

  try {
    const fileBuffer = await fs.readFile(filePath);

    // 👉 usa direttamente Response con il buffer, senza Blob e senza NextResponse
    return new Response(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=offerta_${params.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Errore nel recupero del file PDF:', error);
    return new Response(JSON.stringify({ error: 'Errore nel recupero del file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}