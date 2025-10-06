// app/api/user/update-billing/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const {
    companyName,
    address,
    civicNumber,
    cap,
    city,
    codiceFiscale,
    partitaIva,
    email,
    pec,
    codiceSDI
  } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        companyName,
        billingAddress: address,
        civicNumber,
        cap,
        city,
        codiceFiscale,
        partitaIva,
        billingEmail: email,
        pec,
        codiceSDI
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Errore update fatturazione:", error);
    return NextResponse.json({ error: "Errore durante il salvataggio" }, { status: 500 });
  }
}
