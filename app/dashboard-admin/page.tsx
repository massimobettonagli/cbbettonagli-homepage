import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";
import TabellaRichiesteAdmin from "@/components/TabellaRichiesteAdmin";

const prisma = new PrismaClient();

export default async function DashboardAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.isAdmin) {
    return redirect("/403");
  }

  const richieste = await prisma.richiesta.findMany({
    include: {
      utente: true,
      indirizzoSpedizione: true,
      offerta: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 🔹 Serializza date + gestisci null → stringa vuota
  const richiesteSerializzate = richieste.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    utente: {
      ...r.utente,
      createdAt: r.utente.createdAt.toISOString(),
      updatedAt: r.utente.updatedAt.toISOString(),
    },
    indirizzoSpedizione: {
      ...r.indirizzoSpedizione,
      address: r.indirizzoSpedizione.address ?? "",
      civicNumber: r.indirizzoSpedizione.civicNumber ?? "",
      cap: r.indirizzoSpedizione.cap ?? "",
      city: r.indirizzoSpedizione.city ?? "",
    },
    offerta: r.offerta
      ? {
          ...r.offerta,
          createdAt: r.offerta.createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-[#C73A3A] mb-4">
        Dashboard Amministratore
      </h1>
      <TabellaRichiesteAdmin richieste={richiesteSerializzate} />
    </div>
  );
}