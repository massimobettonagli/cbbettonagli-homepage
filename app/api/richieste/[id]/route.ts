// app/api/richieste/[id]/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id; // articoloId
  const formData = await req.formData();
  const testo = formData.get('testo')?.toString();

  if (!testo) {
    return NextResponse.json({ error: 'Testo mancante' }, { status: 400 });
  }

  try {
    // ✅ aggiorna il testo dell'articolo
    await prisma.articoloRichiesta.update({
      where: { id },
      data: { testo },
    });

    // ✅ salva nuovi file (se presenti)
    const fileEntries = Array.from(formData.entries()).filter(
      ([key, value]) => key.startsWith('file-') && value instanceof File
    );

    for (const [, file] of fileEntries) {
      const buffer = Buffer.from(await (file as File).arrayBuffer());
      const filename = `${crypto.randomUUID()}-${(file as File).name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

      await writeFile(filePath, buffer);

      await prisma.allegato.create({
        data: {
          url: `/uploads/${filename}`,
          articoloId: id, // 👈 corretto
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Errore salvataggio articolo:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}