// app/dashboard-admin/layout.tsx
import SidebarAdmin from '@/components/SidebarAdmin'; // crea questo componente a parte
import '@/app/globals.css'; // importa i tuoi stili globali

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#C73A3A] text-white p-6 flex flex-col justify-between">
        <SidebarAdmin />
      </aside>
      <main className="flex-1 bg-gray-50 p-6 pt-28 overflow-auto">
  {children}
</main>
    </div>
  );
}
