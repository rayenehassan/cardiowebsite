"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#equipe", label: "Équipe" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Navigation principale ── */}
      <div
        className="border-b"
        style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo Ramsay Santé */}
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
                <polygon points="17,17 30,17 17,30" fill="white"/>
              </svg>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  Ramsay Santé
                </p>
                <p className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.6)" }}>
                  Hôpital privé de la Loire
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-white/10"
                  style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.7)" }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {menuOpen && (
            <nav
              className="md:hidden pb-3 pt-2 flex flex-col gap-0.5 border-t"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-white/10"
                  style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.7)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
