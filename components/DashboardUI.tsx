'use client';

import { useEffect, useState } from "react";
import {
  UserCircle,
  Edit,
  MapPin,
  Truck,
  History,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSearchParams } from 'next/navigation';

import ModificaProfiloForm from "@/components/ModificaProfiloForm";
import FatturazioneForm from "@/components/FatturazioneForm";
import ShippingAddressesSection from "@/components/ShippingAddressesSection";
import RichiestaManuale from "@/components/RichiestaManuale";
import StoricoRichieste from "@/components/StoricoRichieste";
import ChatUtente from "@/components/ChatUtente";
import SessionManager from "@/components/SessionManager";
import NotificheCampanella from "@/components/NotificheCampanella";
import InitSocket from '@/components/InitSocket';

interface DashboardUIProps {
  session: any;
}

export default function DashboardUI({ session }: DashboardUIProps) {
  const [activeSection, setActiveSection] = useState("richiesta");
  const searchParams = useSearchParams();

  // ✅ Forza apertura su "messaggi" se presente nel query string o hash
  useEffect(() => {
    const richiesta = searchParams?.get("richiesta");
    const messaggio = searchParams?.get("messaggio");
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    if ((richiesta && messaggio) || hash === "#messaggi") {
      setActiveSection("messaggi");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <SessionManager />
      <InitSocket />

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white shadow-lg p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <UserCircle className="w-8 h-8 text-[#C73A3A]" />
            <h2 className="text-lg font-semibold text-gray-800">
              {session?.user?.name || "Utente"}
            </h2>

            <NotificheCampanella onClick={() => setActiveSection("messaggi")} />
          </div>

          <nav className="flex flex-col space-y-2">
            <SidebarButton
              label="Inserisci una richiesta manualmente"
              active={activeSection === "richiesta"}
              onClick={() => setActiveSection("richiesta")}
              iconColor="text-white"
              bgColor="bg-[#C73A3A]"
              hoverColor="hover:bg-[#a72f2f]"
            />
            <SidebarItem label="Modifica profilo" icon={<Edit className="w-5 h-5" />} active={activeSection === "profilo"} onClick={() => setActiveSection("profilo")} />
            <SidebarItem label="Indirizzo di fatturazione" icon={<MapPin className="w-5 h-5" />} active={activeSection === "fatturazione"} onClick={() => setActiveSection("fatturazione")} />
            <SidebarItem label="Indirizzo di spedizione" icon={<Truck className="w-5 h-5" />} active={activeSection === "spedizione"} onClick={() => setActiveSection("spedizione")} />
            <SidebarItem label="Storico richieste" icon={<History className="w-5 h-5" />} active={activeSection === "storico"} onClick={() => setActiveSection("storico")} />
            <SidebarItem label="Messaggi" icon={<MessageCircle className="w-5 h-5" />} active={activeSection === "messaggi"} onClick={() => setActiveSection("messaggi")} />
          </nav>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-md text-[#C73A3A] hover:bg-gray-100 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-6 md:p-10 overflow-y-auto">
       {activeSection === "richiesta" && <RichiestaManuale />}
        {activeSection === "profilo" && <ModificaProfiloForm />}
        {activeSection === "fatturazione" && <FatturazioneForm />}
        {activeSection === "spedizione" && <ShippingAddressesSection />}
        {activeSection === "storico" && <StoricoRichieste />}
       {activeSection === "messaggi" && <ChatUtente />}
      </section>
    </main>
  );
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition ${
        active
          ? "bg-[#C73A3A] text-white"
          : "text-gray-700 hover:text-[#C73A3A]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SidebarButton({
  label,
  onClick,
  iconColor,
  bgColor,
  hoverColor,
  active,
}: {
  label: string;
  onClick: () => void;
  iconColor?: string;
  bgColor?: string;
  hoverColor?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 py-2 px-3 rounded-lg font-medium transition ${bgColor} ${iconColor} ${hoverColor}`}
    >
      <span>{label}</span>
    </button>
  );
}