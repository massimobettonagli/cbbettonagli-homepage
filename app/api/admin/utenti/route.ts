// app/api/admin/utenti/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any).isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const utenti = await prisma.user.findMany({
      where: {
        isAdmin: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(utenti);
  } catch (error) {
    console.error(error);
    return new NextResponse('Errore nel recupero utenti', { status: 500 });
  }
}