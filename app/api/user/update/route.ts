import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);


  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();

    const updateData: any = {
      name,
      email,
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
  where: { id: session.user.id },
  data: updateData,
});

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Errore update profilo:', error);
    return NextResponse.json({ error: 'Errore interno durante la modifica' }, { status: 500 });
  }
}