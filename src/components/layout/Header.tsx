"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, MessageSquare } from "lucide-react";
import { SiteBrand } from "@/types/site";

const navLinks = [
  { hash: "accueil", label: "Accueil" },
  { hash: "interventions", label: "Interventions" },
  { hash: "equipe", label: "Équipe" },
];

interface Props {
  brand: SiteBrand;
}

export default function Header({ brand }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Une seule entrée vers l'assistant à la fois : le bouton ici sur
  // l'accueil, la bulle flottante sur les fiches (là où les questions
  // naissent). Voir ChatWidget, qui applique la règle symétrique.
  const isHome = pathname === "/";

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    setMenuOpen(false);
    if (pathname !== "/") {
      return;
    }
    e.preventDefault();
    if (hash === "accueil") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/#${hash}`);
    }
  }

  function openChat() {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("cardio:open-chat"));
  }

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
    } else {
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-50 print:hidden bg-primary">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Nom composé, sans pictogramme : c'est la norme des
              établissements de santé français, et un logo abstrait
              générique valait moins que le nom lui-même. */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="min-w-0 flex-shrink py-2 leading-tight"
          >
            <span
              className="block text-lg font-bold text-white truncate"
              style={{ fontFamily: "var(--font-heading)" }}
              title={brand.name}
            >
              {brand.name}
            </span>
            <span
              className="block text-sm text-white/80 truncate"
              title={brand.subtitle}
            >
              {brand.subtitle}
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden md:flex items-center">
              {navLinks.map(({ hash, label }) => (
                <Link
                  key={hash}
                  href={`/#${hash}`}
                  onClick={(e) => handleNavClick(e, hash)}
                  className="inline-flex items-center min-h-11 px-3 text-base text-white/90 hover:text-white hover:underline underline-offset-8 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {isHome && (
              <button
                onClick={openChat}
                className="hidden md:inline-flex items-center gap-2 min-h-11 ml-2 px-4 text-base text-white border border-white/40 transition-colors hover:bg-white/10 hover:border-white cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Poser une question
              </button>
            )}

            <button
              className="md:hidden inline-flex items-center justify-center min-w-11 min-h-11 text-white transition-colors hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-3 flex flex-col border-t border-white/20">
            {navLinks.map(({ hash, label }) => (
              <Link
                key={hash}
                href={`/#${hash}`}
                className="flex items-center min-h-12 px-1 text-base text-white/90 transition-colors hover:text-white"
                onClick={(e) => handleNavClick(e, hash)}
              >
                {label}
              </Link>
            ))}
            {isHome && (
              <button
                onClick={openChat}
                className="mt-2 inline-flex items-center justify-center gap-2 min-h-12 px-4 text-base text-white border border-white/40 transition-colors hover:bg-white/10 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Poser une question
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
