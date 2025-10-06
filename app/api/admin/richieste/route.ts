import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const utenteId = searchParams.get('utenteId');

  if (!utenteId) {
    return NextResponse.json({ error: 'Parametro utenteId mancante' }, { status: 400 });
  }

  const richieste = await prisma.richiesta.findMany({
  where: { utenteId },
  select: {
    id: true,
    numero: true,
    anno: true,
  },
  orderBy: { createdAt: 'desc' },
});

  return NextResponse.json(richieste);
}