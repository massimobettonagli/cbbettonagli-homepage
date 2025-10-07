import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from '../../../../lib/sendVerificationEmail';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password obbligatorie" }, { status: 400 });
    }

    // Controlla se esiste già
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email già registrata" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crea utente
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    });

    // 2. Genera token
    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 ora

    await prisma.verificationToken.create({
      data: {
        token,
        userEmail: email,
        expires,
      },
    });

    // 3. Invia email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verifica-email?token=${token}`;

    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Errore nella registrazione:", err);
    return NextResponse.json({ error: "Errore nella registrazione" }, { status: 500 });
  }
}