"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  FileText,
  LogOut,
  PlusCircle,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/interventions", label: "Interventions", icon: FileText },
  {
    href: "/admin/interventions/new",
    label: "Nouvelle intervention",
    icon: PlusCircle,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-primary-dark text-white flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-blue-800">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <Heart className="w-6 h-6" fill="currentColor" />
          <span>CardioInfo</span>
        </Link>
        <p className="text-blue-300 text-xs mt-1">Espace admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pied de page */}
      <div className="p-3 border-t border-blue-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors mb-1"
        >
          Voir le site public
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
