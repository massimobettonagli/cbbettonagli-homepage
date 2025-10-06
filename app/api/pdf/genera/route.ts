// app/api/pdf/genera/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const { richieste, indirizzo } = await req.json();
  const now = new Date();
  const anno = now.getFullYear();

  // Trova l'utente autenticato
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
  }

  // Recupera l'ultimo numero progressivo
  const ultimo = await prisma.richiesta.findFirst({
    where: { anno },
    orderBy: { numero: 'desc' },
  });
  const numero = (ultimo?.numero || 0) + 1;

  // ✅ Crea la richiesta nel DB con utenteId e indirizzoId
  const nuovaRichiesta = await prisma.richiesta.create({
    data: {
      numero,
      anno,
      utenteId: user.id,
      indirizzoId: indirizzo.id, // 👈 importante passare l'id dall'oggetto ricevuto
    },
  });

  // Genera il PDF
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // formato A4
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, y: number, size = 12) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  drawText(`CB Bettonagli Srl`, 800);
  drawText(`Via E. Scuri, 16 – 24048 Treviolo (BG)`, 785);
  drawText(`info@cbbettonagli.it`, 770);

  drawText(`Richiesta n. ${numero}/${anno}`, 740, 14);

  drawText(`Destinatario:`, 710, 13);
  drawText(`${indirizzo.label}`, 695);
  drawText(`${indirizzo.address}, ${indirizzo.civicNumber || ''}`, 680);
  drawText(`${indirizzo.cap} ${indirizzo.city}`, 665);

  let y = 640;
  richieste.forEach((r: any, i: number) => {
    drawText(`Richiesta ${i + 1}:`, y, 12);
    y -= 15;
    drawText(r.testo || '(nessuna descrizione)', y);
    y -= 30;
  });

  const pdfBytes = await doc.save();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=richiesta_${numero}_${anno}.pdf`,
    },
  });
}

// ✅ GET per scaricare un PDF già salvato
export async function GET(req: Request) {
  const url = new URL(req.url || '');
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
  }

  const richiesta = await prisma.richiesta.findUnique({
    where: { id },
  });

  if (!richiesta) {
    return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, y: number, size = 12) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  drawText(`CB Bettonagli Srl`, 800);
  drawText(`Via E. Scuri, 16 – 24048 Treviolo (BG)`, 785);
  drawText(`info@cbbettonagli.it`, 770);

  drawText(`Richiesta n. ${richiesta.numero}/${richiesta.anno}`, 740, 14);
  drawText(`Data: ${richiesta.createdAt.toLocaleDateString()}`, 720, 12);

  const pdfBytes = await doc.save();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=richiesta_${richiesta.numero}_${richiesta.anno}.pdf`,
    },
  });
}
