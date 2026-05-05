"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-xl"
          >
            <Heart className="w-7 h-7" fill="currentColor" />
            <span>CardioInfo</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/#interventions"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Interventions
            </Link>
            <Link
              href="/#contact"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Bouton du menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-alt transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation mobile */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-border pt-4 flex flex-col gap-3">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/#interventions"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Interventions
            </Link>
            <Link
              href="/#contact"
              className="text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
