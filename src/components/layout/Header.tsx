"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50">
      <div
        className="border-b"
        style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2.5 py-2 min-w-0 flex-shrink">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true" className="shrink-0">
                <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
                <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
                <polygon points="17,17 30,17 17,30" fill="white"/>
              </svg>
              <div className="leading-tight min-w-0">
                <p
                  className="text-[15px] font-bold text-white truncate"
                  style={{ fontFamily: "var(--font-heading)" }}
                  title={brand.name}
                >
                  {brand.name}
                </p>
                <p
                  className="text-[13px] font-medium truncate"
                  style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.85)" }}
                  title={brand.subtitle}
                >
                  {brand.subtitle}
                </p>
              </div>
            </Link>

            {/* Right cluster: nav (desktop) / burger (mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ hash, label }) => (
                  <Link
                    key={hash}
                    href={`/#${hash}`}
                    onClick={(e) => handleNavClick(e, hash)}
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
              {navLinks.map(({ hash, label }) => (
                <Link
                  key={hash}
                  href={`/#${hash}`}
                  className="px-4 py-3 text-[16px] font-medium rounded-lg transition-colors hover:bg-white/10"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                  onClick={(e) => handleNavClick(e, hash)}
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
