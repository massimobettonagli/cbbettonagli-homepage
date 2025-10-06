// app/api/articoli/create/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const richiestaId = formData.get('richiestaId') as string;
  const testo = formData.get('testo') as string;

  if (!richiestaId || !testo) {
    return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
  }

  try {
    // 1. Crea l’articolo legato a una richiesta
    const articolo = await prisma.articoloRichiesta.create({
      data: {
        testo,
        richiestaId, // 👈 foreign key obbligatoria
      },
    });

    // 2. Salva eventuali allegati
    const fileKeys = Array.from(formData.keys()).filter(k => k.startsWith('file-'));

    for (const key of fileKeys) {
      const file = formData.get(key);
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${articolo.id}-${key}.jpg`;
        const filePath = path.join(process.cwd(), 'public/uploads', filename);

        // ✅ Node.js invece di Bun
        await writeFile(filePath, buffer);

        await prisma.allegato.create({
          data: {
            url: `/uploads/${filename}`,
            articoloId: articolo.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, articolo });
  } catch (err) {
    console.error('❌ Errore creazione articolo:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}