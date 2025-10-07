// app/api/articoli/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface AllegatoInput {
  url: string;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const articoloId = params.id;
  const formData = await req.formData();
  const testo = formData.get('testo')?.toString();

  if (!testo) {
    return NextResponse.json({ error: 'Campo testo mancante' }, { status: 400 });
  }

  try {
    // 1. Verifica esistenza articolo
    const articolo = await prisma.articoloRichiesta.findUnique({
      where: { id: articoloId },
    });

    if (!articolo) {
      return NextResponse.json({ error: 'Articolo non trovato' }, { status: 404 });
    }

    // 2. Elimina allegati precedenti
    await prisma.allegato.deleteMany({
      where: { articoloId },
    });

    // 3. Salva nuovi file
    const nuoviAllegati: AllegatoInput[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const filename = `${randomUUID()}-${value.name}`;
        const filePath = path.join(process.cwd(), 'public/uploads', filename);

        await writeFile(filePath, buffer);

        nuoviAllegati.push({
          url: `/uploads/${filename}`,
        });
      }
    }

    // 4. Aggiorna il testo e aggiungi gli allegati
    await prisma.articoloRichiesta.update({
      where: { id: articoloId },
      data: {
        testo,
        allegati: {
          createMany: {
            data: nuoviAllegati,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Errore salvataggio articolo:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}