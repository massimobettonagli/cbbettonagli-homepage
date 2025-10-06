import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const address = await prisma.shippingAddress.findUnique({
    where: { id },
  });

  if (!address) {
    return NextResponse.json({ error: 'Indirizzo non trovato' }, { status: 404 });
  }

  return NextResponse.json(address);
}
