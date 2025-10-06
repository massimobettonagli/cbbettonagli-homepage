// app/api/pdf/anteprima/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'generated-pdfs', 'anteprima_richiesta.pdf');
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="anteprima_richiesta.pdf"',
      },
    });
  } catch (error) {
    console.error('Errore durante la lettura del PDF:', error);
    return NextResponse.json({ error: 'Anteprima PDF non trovata.' }, { status: 404 });
  }
}

export const dynamic = "force-dynamic";

