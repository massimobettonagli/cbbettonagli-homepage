// app/dashboard/modifica-richiesta/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import ModificaRichiestaForm from "@/components/ModificaRichiestaForm";

const prisma = new PrismaClient();

export default async function ModificaRichiestaPage({ params }: { params: { id: string } }) {
  // Recupero articolo con allegati e richiesta collegata
  const articolo = await prisma.articoloRichiesta.findUnique({
    where: { id: params.id },
    include: {
      allegati: true,
      richiesta: { include: { indirizzoSpedizione: true } },
    },
  });

  if (!articolo) {
    return <div className="p-6 text-red-600">Articolo non trovato</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold text-[#C73A3A]">Modifica richiesta</h1>
      {/* ✅ Passiamo articolo come prop */}
      <ModificaRichiestaForm articolo={articolo} />
    </div>
  );
}

