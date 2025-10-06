// app/dashboard/modifica-articolo/[id]/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";
import ModificaRichiestaForm from "@/components/ModificaRichiestaForm";

const prisma = new PrismaClient();

export default async function ModificaArticoloPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return notFound();

  const articolo = await prisma.articoloRichiesta.findUnique({
    where: { id: params.id },
    include: { allegati: true },
  });
console.log('Articolo caricato:', articolo);
  if (!articolo) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold text-[#C73A3A]">Modifica articolo</h1>
      <ModificaRichiestaForm articolo={articolo} />
    </div>
  );
}