export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const richieste = await prisma.richiesta.findMany({
      where: { utenteId: user.id },
      select: {
        id: true,
        numero: true,
        anno: true,
        createdAt: true,
        stato: true,
        indirizzoSpedizione: {
          select: { label: true },
        },
        offerta: {
          select: {
            fileUrl: true,
            vista: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(richieste);
  } catch (error) {
    console.error('Errore nella route /api/user/richieste:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}