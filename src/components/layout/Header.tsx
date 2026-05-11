"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#equipe", label: "Équipe" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div
        className="border-b"
        style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 py-2">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
                <polygon points="17,17 30,17 17,30" fill="white"/>
              </svg>
              <div className="leading-tight">
                <p
                  className="text-[15px] font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Ramsay Santé
                </p>
                <p
                  className="text-[13px] font-medium"
                  style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.85)" }}
                >
                  Hôpital privé de la Loire
                </p>
              </div>
            </Link>

            {/* Right cluster: nav (desktop) / burger (mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-3 text-[15px] font-medium rounded-lg transition-colors hover:bg-white/10 focus-visible:bg-white/10"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "rgba(255,255,255,0.92)",
                      minHeight: "44px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Mobile toggle */}
              <button
                className="md:hidden p-3 rounded-lg transition-colors hover:bg-white/10"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
                style={{ color: "rgba(255,255,255,0.95)", minHeight: "44px", minWidth: "44px" }}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav
              className="md:hidden pb-3 pt-2 flex flex-col gap-1 border-t"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-3 text-[16px] font-medium rounded-lg transition-colors hover:bg-white/10"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "rgba(255,255,255,0.92)",
                  }}
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
