import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const richiestaId = formData.get('richiestaId')?.toString();
  const file = formData.get('file') as File;

  if (!richiestaId || !file) {
    return NextResponse.json({ error: 'Richiesta ID o file mancante' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public', 'offerte', filename);

  await writeFile(filePath, buffer);

  // Crea o aggiorna offerta
  await prisma.offerta.upsert({
    where: { richiestaId },
    update: {
      fileUrl: `/offerte/${filename}`,
      vista: false,
    },
    create: {
      richiestaId,
      fileUrl: `/offerte/${filename}`,
    },
  });

  return NextResponse.json({ success: true });
}
