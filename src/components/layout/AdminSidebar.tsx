"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, ExternalLink, Home, Users } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/interventions", label: "Interventions", icon: FileText },
  { href: "/admin/page-accueil", label: "Page d'accueil", icon: Home },
  { href: "/admin/equipe", label: "Équipe médicale", icon: Users },
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
    <aside className="w-64 flex flex-col min-h-screen shrink-0" style={{ background: "#0F172A" }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
            <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
            <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
            <polygon points="17,17 30,17 17,30" fill="white"/>
          </svg>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Ramsay Santé
            </p>
            <p className="text-[13px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.75)" }}>
              Espace admin
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10 hover:text-white"
              }`}
              style={active ? { fontFamily: "var(--font-heading)" } : { color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-heading)" }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pied de page */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium hover:bg-white/10 hover:text-white transition-colors"
          style={{ color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-heading)" }}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          Voir le site public
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium hover:bg-white/10 hover:text-white transition-colors w-full text-left"
          style={{ color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-heading)" }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
