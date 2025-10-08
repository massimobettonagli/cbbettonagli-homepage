import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Utente non autenticato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const indirizzoId = formData.get('indirizzoId') as string;
    const richiesteRaw = formData.get('richieste');

    if (!richiesteRaw || typeof richiesteRaw !== 'string') {
      return new Response(JSON.stringify({ error: 'Campo richieste mancante o non valido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let richieste: { testo: string }[];
    try {
      richieste = JSON.parse(richiesteRaw);
    } catch {
      return new Response(JSON.stringify({ error: 'Formato richieste non valido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const shipping = await prisma.shippingAddress.findUnique({ where: { id: indirizzoId } });
    if (!user || !shipping) {
      return new Response(JSON.stringify({ error: 'Utente o indirizzo non trovato' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const anno = now.getFullYear();
    const ultimo = await prisma.richiesta.findFirst({ where: { anno }, orderBy: { numero: 'desc' } });
    const numero = (ultimo?.numero || 0) + 1;

    const richiesta = await prisma.richiesta.create({
      data: {
        numero,
        anno,
        stato: 'INVIATA',
        utente: { connect: { id: user.id } },
        indirizzoSpedizione: { connect: { id: shipping.id } },
      },
    });

    for (let i = 0; i < richieste.length; i++) {
      const r = richieste[i];
      const allegati: { url: string }[] = [];

      for (const [key, value] of formData.entries()) {
        if (key.startsWith(`file-${i}-`) && value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const filename = `${Date.now()}-${value.name}`;
          const filepath = path.join(process.cwd(), 'public/uploads', filename);
          await fs.writeFile(filepath, buffer);
          allegati.push({ url: `/uploads/${filename}` });
        }
      }

      await prisma.articoloRichiesta.create({
        data: {
          testo: r.testo,
          richiesta: { connect: { id: richiesta.id } },
          allegati: { create: allegati },
        },
      });
    }

    // Generazione PDF multipagina
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const createPage = () => {
      const page = doc.addPage([595.28, 841.89]);
      const { height } = page.getSize();

      const drawText = (text: string, x: number, y: number, size = 11, bold = false) => {
        page.drawText(text, {
          x,
          y,
          size,
          font: bold ? fontBold : font,
          color: rgb(0, 0, 0),
        });
      };

      const drawBox = (x: number, y: number, w: number, h: number) => {
        page.drawRectangle({ x, y, width: w, height: h, borderColor: rgb(0, 0, 0), borderWidth: 1 });
      };

      return { page, height, drawText, drawBox };
    };

    let { page, height, drawText, drawBox } = createPage();
    let y = height - 80;

    try {
      const logoPath = path.join(process.cwd(), 'public/logo-def-no-sfondo.png');
      const logoBytes = await fs.readFile(logoPath);
      const logoImage = await doc.embedPng(logoBytes);
      page.drawImage(logoImage, { x: 40, y: height - 80, width: 80, height: 60 });
    } catch {}

    drawBox(40, height - 200, 250, 90);
    drawText('CB BETTONAGLI SRL', 50, height - 130, 12, true);
    drawText('Via E. Scuri, 16 – 24048 Treviolo (BG)', 50, height - 145);
    drawText('info@cbbettonagli.it', 50, height - 160);

    drawBox(305, height - 140, 250, 130);
    drawText('Spett.le', 315, height - 30, 12, true);
    drawText(user.companyName || '-', 315, height - 45);
    drawText(`${user.billingAddress || '-'}, ${user.civicNumber || '-'}`, 315, height - 60);
    drawText(`${user.cap || '-'} ${user.city || '-'}`, 315, height - 75);
    drawText(`C.F.: ${user.codiceFiscale || '-'}`, 315, height - 90);
    drawText(`P.IVA: ${user.partitaIva || '-'}`, 315, height - 105);
    drawText(user.billingEmail || '-', 315, height - 120);

    drawBox(305, height - 240, 250, 70);
    drawText('Indirizzo di spedizione:', 315, height - 185, 12, true);
    drawText(`${shipping.label}`, 315, height - 200);
    drawText(`${shipping.address}, ${shipping.civicNumber}`, 315, height - 215);
    drawText(`${shipping.cap} ${shipping.city}`, 315, height - 230);

    drawText(`Richiesta n. ${numero}/${anno}`, 40, height - 270, 20, true);

    y = height - 300;
    drawText('Riepilogo richieste', 40, y, 12, true);
    y -= 20;

    drawBox(40, y - 20, 30, 20); drawText('N.', 45, y - 10);
    drawBox(70, y - 20, 280, 20); drawText('Descrizione', 75, y - 10);
    drawBox(350, y - 20, 180, 20); drawText('Allegati', 355, y - 10);
    y -= 25;

    for (let i = 0; i < richieste.length; i++) {
      const r = richieste[i];
      const immagini: PDFImage[] = [];

      for (const [key, value] of formData.entries()) {
        if (key.startsWith(`file-${i}-`) && value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          try {
            immagini.push(
              value.type === 'image/png'
                ? await doc.embedPng(buffer)
                : await doc.embedJpg(buffer)
            );
          } catch {}
        }
      }

      const imageWidth = 50;
      const imageHeight = 40;
      const imageSpacing = 5;
      const maxRowWidth = 180;
      const imagesPerRow = Math.floor((maxRowWidth + imageSpacing) / (imageWidth + imageSpacing));
      const numRows = Math.ceil(immagini.length / imagesPerRow);
      const boxHeight = Math.max(50, numRows * (imageHeight + imageSpacing) + imageSpacing);

      if (y - boxHeight < 50) {
        ({ page, height, drawText, drawBox } = createPage());
        y = height - 50;
      }

      drawBox(40, y - boxHeight, 30, boxHeight);
      drawText(`${i + 1}`, 45, y - 30);

      drawBox(70, y - boxHeight, 280, boxHeight);
      drawText(r.testo || '-', 75, y - 30);

      drawBox(350, y - boxHeight, 180, boxHeight);
      for (let j = 0; j < immagini.length; j++) {
        const row = Math.floor(j / imagesPerRow);
        const col = j % imagesPerRow;
        const imgX = 355 + col * (imageWidth + imageSpacing);
        const imgY = y - imageSpacing - (row + 1) * (imageHeight + imageSpacing);
        page.drawImage(immagini[j], { x: imgX, y: imgY, width: imageWidth, height: imageHeight });
      }

      y -= boxHeight + 10;
    }

    const pdfBytes = await doc.save();
    const arrayBuffer = pdfBytes.buffer.slice(
  pdfBytes.byteOffset,
  pdfBytes.byteOffset + pdfBytes.byteLength
);

// ✅ Converte in Uint8Array → Buffer → ArrayBuffer, per compatibilità totale
const safeBuffer = new Uint8Array(arrayBuffer);
const fixedBuffer = Buffer.from(safeBuffer);

return new Response(fixedBuffer, {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=richiesta_${numero}_${anno}.pdf`,
    'X-Richiesta-Numero': numero.toString(),
    'X-Richiesta-Anno': anno.toString(),
  },
});
  } catch (err) {
    console.error('❌ Errore generazione PDF multipagina:', err);
    return new Response(JSON.stringify({ error: 'Errore interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}