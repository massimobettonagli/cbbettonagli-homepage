import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="pt-24 px-4 md:px-8"> {/* Spazio sotto la navbar */}
      <DashboardShell session={session} />
    </div>
  );
}