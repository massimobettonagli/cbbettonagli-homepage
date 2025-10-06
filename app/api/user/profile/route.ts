import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Utente non autenticato" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        companyName: true,
        billingAddress: true,
        civicNumber: true,     
        cap: true,             
        city: true,            
        codiceFiscale: true,
        partitaIva: true,
        billingEmail: true,
        pec: true,
        codiceSDI: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Errore durante la lettura del profilo:", error);
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}