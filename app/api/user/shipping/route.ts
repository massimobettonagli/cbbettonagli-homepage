import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { shippingAddresses: true },
  });

  return NextResponse.json({ addresses: user?.shippingAddresses || [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const {
    label,
    address,
    civicNumber,
    cap,
    city,
    companyName,
    codiceFiscale,
    partitaIva,
    email,
    pec,
    codiceSDI
  } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error('Utente non trovato');

    const newAddress = await prisma.shippingAddress.create({
      data: {
        label,
        address,
        civicNumber,
        cap,
        city,
        companyName,
        codiceFiscale,
        partitaIva,
        email,
        pec,
        codiceSDI,
        userId: user.id
      }
    });

    return NextResponse.json({ address: newAddress });
  } catch (err) {
    console.error('Errore creazione indirizzo di spedizione:', err);
    return NextResponse.json({ error: 'Errore durante il salvataggio' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const {
    id,
    label,
    address,
    civicNumber,
    cap,
    city,
    companyName,
    codiceFiscale,
    partitaIva,
    email,
    pec,
    codiceSDI
  } = await req.json();

  try {
    const updated = await prisma.shippingAddress.update({
      where: { id },
      data: {
        label,
        address,
        civicNumber,
        cap,
        city,
        companyName,
        codiceFiscale,
        partitaIva,
        email,
        pec,
        codiceSDI
      }
    });

    return NextResponse.json({ address: updated });
  } catch (err) {
    console.error('Errore aggiornamento indirizzo:', err);
    return NextResponse.json({ error: 'Errore durante l\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
  }

  try {
    await prisma.shippingAddress.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Errore cancellazione indirizzo:', err);
    return NextResponse.json({ error: 'Errore durante la cancellazione' }, { status: 500 });
  }
}