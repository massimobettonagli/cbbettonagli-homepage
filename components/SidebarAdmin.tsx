'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, X, FileText, MessageSquare, LogOut } from 'lucide-react';

export default function SidebarAdmin() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Gestione Richieste', href: '/dashboard-admin', icon: <FileText className="w-5 h-5" /> },
    { label: 'Messaggi', href: '/dashboard-admin/messaggi', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#C73A3A] p-2 rounded-md text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#C73A3A] text-white flex flex-col justify-between px-6 pt-28 pb-6 transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Admin</h2>
          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${pathname === item.href ? 'bg-white text-[#C73A3A]' : 'hover:bg-[#a93232]'}`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-gray-200"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>
    </>
  );
}