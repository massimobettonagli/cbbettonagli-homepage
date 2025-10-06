'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, FileText, MessageSquare } from 'lucide-react';
import { signOut } from 'next-auth/react';
import InitSocket from '@/components/InitSocket'; // ✅ Importato

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Gestione Richieste', href: '/dashboard-admin', icon: <FileText className="w-5 h-5" /> },
    { label: 'Messaggi', href: '/dashboard-admin/messaggi', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Inizializza socket lato client */}
      <InitSocket />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#C73A3A] mb-6">Admin</h2>
          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${pathname === item.href ? 'bg-[#C73A3A] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}