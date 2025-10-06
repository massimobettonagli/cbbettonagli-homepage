// app/dashboard-admin/richiesta/[id]/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import UploadOfferta from '@/components/UploadOfferta';

const prisma = new PrismaClient();

export default async function RichiestaAdminPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return notFound();

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.isAdmin) return notFound();

  const richiesta = await prisma.richiesta.findUnique({
    where: { id: params.id },
    include: {
      utente: true,
      indirizzoSpedizione: true,
      articoli: {
        include: { allegati: true },
      },
    },
  });

  if (!richiesta) return notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#C73A3A]">
        Dettaglio Richiesta n. {richiesta.numero}/{richiesta.anno}
      </h1>

      <div className="space-y-1 text-sm">
        <p><strong>Cliente:</strong> {richiesta.utente?.name} ({richiesta.utente?.email})</p>
        <p><strong>Indirizzo:</strong> {richiesta.indirizzoSpedizione?.label}</p>
        <p><strong>Data:</strong> {new Date(richiesta.createdAt).toLocaleString()}</p>
      </div>

      <div className="flex gap-4">
        <Link
          href={`/api/richiesta/${richiesta.id}/pdf`}
          className="bg-[#C73A3A] text-white px-4 py-2 rounded hover:bg-[#a72f2f]"
        >
          Scarica PDF
        </Link>
        <Link
          href={`/api/richiesta/${richiesta.id}/xls`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Scarica XLS
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Articoli</h2>
<h2 className="text-lg font-semibold mt-8">Carica offerta PDF</h2>
<UploadOfferta richiestaId={params.id} />
        <ul className="list-disc list-inside text-sm space-y-2 mt-2">
          {richiesta.articoli.map((art, i) => (
            <li key={art.id}>
              <strong>{i + 1}.</strong> {art.testo}{' '}
              {art.allegati.length > 0 && (
                <span className="text-gray-500">
                  ({art.allegati.length} allegati)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}