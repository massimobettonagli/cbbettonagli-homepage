'use client';

import { useSession } from "next-auth/react";
import DashboardUI from "@/components/DashboardUI";

export default function DashboardClientWrapper() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center text-gray-500">Caricamento...</p>;
  }

  if (!session) {
    return <p className="text-red-500 text-center">Non autorizzato.</p>;
  }

  return <DashboardUI session={session} />;
}