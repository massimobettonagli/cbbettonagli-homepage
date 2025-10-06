// app/api/richiesta/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const richiestaId = params.id;
    const richiesta = await prisma.richiesta.findUnique({
      where: { id: richiestaId },
      include: {
        utente: true,
        indirizzoSpedizione: true,
        articoli: { include: { allegati: true } },
      },
    });

    if (!richiesta) return new NextResponse('Richiesta non trovata', { status: 404 });

    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
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

    // Logo
    try {
      const logoPath = path.join(process.cwd(), 'public/logo-def-no-sfondo.png');
      const logoBytes = await fs.readFile(logoPath);
      const logoImage = await doc.embedPng(logoBytes);
      page.drawImage(logoImage, { x: 40, y: height - 80, width: 80, height: 60 });
    } catch (err) {
      console.warn('Logo non trovato:', err);
    }

    const { utente: user, indirizzoSpedizione: shipping, articoli, numero, anno } = richiesta;

    // Riquadro dati azienda
    drawBox(40, height - 200, 250, 90);
    drawText('CB BETTONAGLI SRL', 50, height - 130, 12, true);
    drawText('Via E. Scuri, 16 – 24048 Treviolo (BG)', 50, height - 145);
    drawText('info@cbbettonagli.it', 50, height - 160);

    // Riquadro cliente
    drawBox(305, height - 140, 250, 130);
    drawText('Spett.le', 315, height - 30, 12, true);
    drawText(user.companyName || '-', 315, height - 45);
    drawText(`${user.billingAddress || '-'}, ${user.civicNumber || '-'}`, 315, height - 60);
    drawText(`${user.cap || '-'} ${user.city || '-'}`, 315, height - 75);
    drawText(`C.F.: ${user.codiceFiscale || '-'}`, 315, height - 90);
    drawText(`P.IVA: ${user.partitaIva || '-'}`, 315, height - 105);
    drawText(user.billingEmail || '-', 315, height - 120);

    // Riquadro spedizione
    drawBox(305, height - 240, 250, 70);
    drawText('Indirizzo di spedizione:', 315, height - 185, 12, true);
    drawText(`${shipping.label}`, 315, height - 200);
    drawText(`${shipping.address}, ${shipping.civicNumber}`, 315, height - 215);
    drawText(`${shipping.cap} ${shipping.city}`, 315, height - 230);

    // Titolo
    drawText(`Richiesta n. ${numero}/${anno}`, 40, height - 270, 20, true);

    // Tabella riepilogo
    let y = height - 300;
    drawText('Riepilogo richieste', 40, y, 12, true);
    y -= 20;
    drawBox(40, y - 20, 30, 20); drawText('N.', 45, y - 10);
    drawBox(70, y - 20, 280, 20); drawText('Descrizione', 75, y - 10);
    drawBox(350, y - 20, 180, 20); drawText('Allegati', 355, y - 10);
    y -= 25;

    for (let i = 0; i < articoli.length; i++) {
      const r = articoli[i];
      const immagini: PDFImage[] = []; // ✅ tipizzazione corretta

      for (const allegato of r.allegati) {
        try {
          const imagePath = path.join(process.cwd(), 'public', allegato.url.replace('/uploads/', 'uploads/'));
          const imageBytes = await fs.readFile(imagePath);
          const image = allegato.url.toLowerCase().endsWith('.png')
            ? await doc.embedPng(imageBytes)
            : await doc.embedJpg(imageBytes);
          immagini.push(image); // ✅ ora funziona
        } catch (err) {
          console.warn('Errore con immagine:', allegato.url);
        }
      }

      const imageWidth = 50;
      const imageHeight = 40;
      const imageSpacing = 5;
      const maxRowWidth = 180;
      const imagesPerRow = Math.floor((maxRowWidth + imageSpacing) / (imageWidth + imageSpacing));
      const numRows = Math.ceil(immagini.length / imagesPerRow);
      const boxHeight = Math.max(50, numRows * (imageHeight + imageSpacing) + imageSpacing);

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
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=richiesta_${numero}_${anno}.pdf`,
      },
    });
  } catch (err) {
    console.error('❌ Errore generazione PDF:', err);
    return new NextResponse('Errore interno del server', { status: 500 });
  }
}
