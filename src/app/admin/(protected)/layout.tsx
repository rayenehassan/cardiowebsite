import AdminSidebar from "@/components/layout/AdminSidebar";
import { getAdminPageSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminPageSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
