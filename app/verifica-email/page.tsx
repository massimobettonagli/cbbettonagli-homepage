"use client";

import { Suspense } from "react";
import VerificaEmailClient from "./VerificaEmailClient";

// ✅ forza rendering dinamico ed evita l'errore in fase di export
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function VerificaEmailPage() {
  return (
    <Suspense fallback={<p>Verifica in corso...</p>}>
      <VerificaEmailClient />
    </Suspense>
  );
}
