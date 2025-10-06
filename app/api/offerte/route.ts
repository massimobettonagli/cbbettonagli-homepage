import { writeFile, unlink } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { inviaNotificaUtente } from '@/lib/notifiche';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const richiestaId = formData.get('richiestaId')?.toString();

  if (!file || !richiestaId) {
    return NextResponse.json({ error: 'File o richiestaId mancanti' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}-${file.name}`;
  const dir = path.join(process.cwd(), 'public', 'offerte');
  const filePath = path.join(dir, filename);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await writeFile(filePath, buffer);

  // Rimuove eventuale offerta esistente
  await prisma.offerta.deleteMany({ where: { richiestaId } });

  // Crea la nuova offerta
  const offerta = await prisma.offerta.create({
    data: {
      fileUrl: `/offerte/${filename}`,
      richiestaId,
    },
  });

  // Aggiorna stato richiesta
  const richiesta = await prisma.richiesta.update({
    where: { id: richiestaId },
    data: { stato: 'COMPLETATA' },
    include: { utente: true },
  });

  // Notifica all'utente
  if (richiesta.utente?.id) {
    inviaNotificaUtente({
      utenteId: richiesta.utente.id,
      richiestaId,
      contenuto: 'È stata caricata una nuova offerta per la tua richiesta.',
    });
  }

  return NextResponse.json(offerta);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const richiestaId = searchParams.get("richiestaId");

  if (!richiestaId) {
    return NextResponse.json({ error: "Missing richiestaId" }, { status: 400 });
  }

  const offerta = await prisma.offerta.findUnique({
    where: { richiestaId },
  });

  if (!offerta) {
    return NextResponse.json({ error: "Offerta non trovata" }, { status: 404 });
  }

  if (offerta.fileUrl) {
    try {
      const filePath = path.join(process.cwd(), 'public', offerta.fileUrl);
      await unlink(filePath);
    } catch (err) {
      console.warn("⚠️ File non trovato o già eliminato:", err);
    }
  }

  await prisma.offerta.delete({
    where: { richiestaId },
  });

  // Facoltativo: aggiorna stato e invia notifica
  const richiesta = await prisma.richiesta.update({
    where: { id: richiestaId },
    data: { stato: 'IN_LAVORAZIONE' },
    include: { utente: true },
  });

  if (richiesta.utente?.id) {
    inviaNotificaUtente({
      utenteId: richiesta.utente.id,
      richiestaId,
      contenuto: 'L\'offerta precedente è stata rimossa. Verrai aggiornato appena disponibile una nuova.',
    });
  }

  return NextResponse.json({ success: true });
}