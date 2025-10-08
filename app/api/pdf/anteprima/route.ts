import path from 'path';
import { readFile } from 'fs/promises';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'generated-pdfs', 'anteprima_richiesta.pdf');
    const fileBuffer = await readFile(filePath);

    // Usa la Response nativa, non NextResponse
    return new Response(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="anteprima_richiesta.pdf"',
      },
    });
  } catch (error) {
    console.error('Errore durante la lettura del PDF:', error);
    return new Response(JSON.stringify({ error: 'Anteprima PDF non trovata.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Forza esecuzione lato server
export const dynamic = 'force-dynamic';