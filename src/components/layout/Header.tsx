"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "#0F172A",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "17px", color: "#ffffff" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <Activity className="w-4 h-4" style={{ color: "#ffffff" }} />
            </div>
            Cardio<span style={{ color: "#7DD3FC" }}>Info</span>
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

        {/* Mobile nav */}
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
    </header>
  );
}
