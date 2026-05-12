import Link from "next/link";
import { Phone } from "lucide-react";
import { SiteBrand, SiteFooter } from "@/types/site";

const navLinks = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#equipe", label: "Équipe" },
];

interface Props {
  brand: SiteBrand;
  footer: SiteFooter;
}

export default function Footer({ brand, footer }: Props) {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "#F8FAFF", borderColor: "rgba(0,0,0,0.08)" }}
    >
      {/* Urgence band — numéro 15 SAMU figé en dur (sécurité médicale) */}
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
                  {brand.name}
                </p>
                <p
                  className="text-sm text-muted"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {brand.subtitle}
                </p>
              </div>
            </div>
            <p className="text-base text-muted leading-relaxed">
              {footer.description}
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
              {footer.contact.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              {footer.contact.phoneLabel && (
                <p>
                  <a
                    href={footer.contact.phoneHref || `tel:${footer.contact.phoneLabel.replace(/\D/g, "")}`}
                    className="hover:text-foreground transition-colors"
                    style={{ minHeight: "44px", display: "inline-flex", alignItems: "center" }}
                  >
                    {footer.contact.phoneLabel}
                  </a>
                </p>
              )}
            </address>
          </div>

        </div>

        {/* Bottom */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <p className="text-sm text-muted">
            {footer.bottomNote}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              href="/mentions-legales"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Mentions légales
            </Link>
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} {brand.name} · {brand.subtitle}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
