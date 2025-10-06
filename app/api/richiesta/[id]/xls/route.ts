// app/api/richiesta/[id]/xls/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Workbook } from 'exceljs';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const richiesta = await prisma.richiesta.findUnique({
    where: { id: params.id },
    include: {
      utente: true,
      indirizzoSpedizione: true,
      articoli: {
        include: { allegati: true },
      },
    },
  });

  if (!richiesta) {
    return new NextResponse('Richiesta non trovata', { status: 404 });
  }

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Riepilogo Richiesta');

  sheet.addRow(['Numero', 'Anno', 'Cliente', 'Email', 'Indirizzo']);
  sheet.addRow([
    richiesta.numero,
    richiesta.anno,
    richiesta.utente?.name,
    richiesta.utente?.email,
    `${richiesta.indirizzoSpedizione?.label} - ${richiesta.indirizzoSpedizione?.address}, ${richiesta.indirizzoSpedizione?.civicNumber} - ${richiesta.indirizzoSpedizione?.cap} ${richiesta.indirizzoSpedizione?.city}`
  ]);

  sheet.addRow([]);
  sheet.addRow(['#', 'Descrizione', 'Allegati']);
  richiesta.articoli.forEach((art, idx) => {
    const allegati = art.allegati.map(a => a.url.split('/').pop()).join(', ') || '-';
    sheet.addRow([idx + 1, art.testo, allegati]);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=richiesta_${richiesta.numero}_${richiesta.anno}.xlsx`,
    },
  });
}