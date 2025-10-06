import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Utente non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID mancante" }, { status: 400 });
  }

  console.log('DEBUG - id richiesta:', id);
  console.log('DEBUG - email utente:', session.user.email);

  try {
    const richiesta = await prisma.richiesta.findFirst({
      where: {
        id,
        utente: { email: session.user.email },
        stato: { in: ['INVIATA', 'IN_LAVORAZIONE'] },
      },
    });

    console.log('DEBUG - richiesta trovata:', richiesta);

    if (!richiesta) {
      return NextResponse.json({ error: "Richiesta non trovata o non eliminabile" }, { status: 404 });
    }

    // Trova articoli collegati
    const articoli = await prisma.articoloRichiesta.findMany({
      where: { richiestaId: id },
      select: { id: true },
    });
    const articoloIds = articoli.map((a) => a.id);

    // 1. Elimina allegati (relazione con ArticoloRichiesta)
    if (articoloIds.length > 0) {
      await prisma.allegato.deleteMany({
        where: { articoloId: { in: articoloIds } },
      });
    }

    // 2. Elimina articoli
    await prisma.articoloRichiesta.deleteMany({
      where: { richiestaId: id },
    });

    // 3. Elimina messaggi
    await prisma.messaggio.deleteMany({
      where: { richiestaId: id },
    });

    // 4. Elimina offerta (1:1)
    await prisma.offerta.deleteMany({
      where: { richiestaId: id },
    });

    // 5. Infine elimina la richiesta
    await prisma.richiesta.delete({
      where: { id },
    });

    console.log('DEBUG - richiesta eliminata con successo');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione richiesta:", error);
    return NextResponse.json({ error: "Errore durante l'eliminazione" }, { status: 500 });
  }
}