import AdminShell from "@/components/layout/AdminShell";
import { getAdminPageSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminPageSession();
  if (!session) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
