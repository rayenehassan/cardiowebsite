import Link from "next/link";
import { Phone } from "lucide-react";

const navLinks = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#equipe", label: "Équipe" },
];

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "#F8FAFF", borderColor: "rgba(0,0,0,0.08)" }}
    >
      {/* Urgence band */}
      <div
        className="border-b"
        style={{ background: "#ffffff", borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <a
            href="tel:15"
            className="flex items-center justify-center sm:justify-start gap-3 text-foreground hover:text-primary transition-colors"
            style={{ minHeight: "44px" }}
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
              aria-hidden="true"
            >
              <Phone className="w-5 h-5" style={{ color: "#B91C1C" }} />
            </span>
            <span className="leading-tight">
              <span
                className="block text-[15px] font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                En cas d&apos;urgence cardiaque
              </span>
              <span className="block text-base" style={{ color: "#475569" }}>
                Composez le <span className="font-semibold text-foreground">15</span> (Samu) — service gratuit, 24h/24
              </span>
            </span>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true" className="flex-shrink-0">
                <rect x="0"  y="0"  width="13" height="13" rx="1" fill="#0284C7"/>
                <rect x="17" y="0"  width="13" height="13" rx="1" fill="#0284C7"/>
                <rect x="0"  y="17" width="13" height="13" rx="1" fill="#0284C7"/>
                <polygon points="17,17 30,17 17,30" fill="#0284C7"/>
              </svg>
              <div className="leading-tight">
                <p
                  className="text-base font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Ramsay Santé
                </p>
                <p
                  className="text-sm text-muted"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Hôpital Privé de la Loire
                </p>
              </div>
            </div>
            <p className="text-base text-muted leading-relaxed">
              Plateforme d&apos;information sur les procédures pratiquées par l&apos;équipe
              de cardiologie interventionnelle de l&apos;Hôpital Privé de la Loire.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3
              className="text-base font-semibold text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Liens rapides
            </h3>
            <ul className="space-y-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block py-2.5 text-base text-muted hover:text-foreground transition-colors"
                    style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-base font-semibold text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact
            </h3>
            <address className="not-italic text-base text-muted space-y-1.5">
              <p>Hôpital Privé de la Loire</p>
              <p>Saint-Étienne, France</p>
              <p>
                <a
                  href="tel:0478229112"
                  className="hover:text-foreground transition-colors"
                  style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
                >
                  Tél. : 04 78 22 91 12
                </a>
              </p>
            </address>
          </div>

        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <p className="text-sm text-muted">
            Ce site ne collecte aucune donnée, n&apos;utilise pas de cookies et ne suit pas les visiteurs.
          </p>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Ramsay Santé · Hôpital Privé de la Loire
          </p>
        </div>
      </div>
    </footer>
  );
}
