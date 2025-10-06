'use client';

import DashboardUI from "@/components/DashboardUI";

export default function DashboardShell({ session }: { session: any }) {
  return <DashboardUI session={session} />;
}