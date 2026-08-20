import Link from "next/link";
import { Phone } from "lucide-react";
import { SiteBrand, SiteFooter } from "@/types/site";
import { frenchTypography } from "@/lib/text";

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
    <footer className="mt-auto border-t border-border bg-surface print:hidden">
      {/* Bandeau urgence — le 15 est figé en dur (sécurité médicale).
          C'est le seul endroit du site où la couleur d'urgence sert. */}
      <div className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3">
          <a
            href="tel:15"
            className="flex items-center gap-3 min-h-11 text-foreground hover:text-danger transition-colors"
          >
            <Phone className="w-5 h-5 shrink-0 text-danger" aria-hidden="true" />
            <span className="leading-tight">
              <span className="block text-base font-semibold">
                En cas d&rsquo;urgence cardiaque
              </span>
              <span className="block text-base text-muted">
                Composez le <span className="font-semibold text-foreground">15</span>{" "}
                (Samu) — service gratuit, 24h/24
              </span>
            </span>
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <p
              className="text-lg font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {brand.name}
            </p>
            <p className="text-base text-muted-soft mb-3">{brand.subtitle}</p>
            <p className="text-base text-muted">
              {frenchTypography(footer.description)}
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">
              Liens rapides
            </h2>
            <ul className="flex flex-col">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center min-h-11 text-base text-muted hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">Contact</h2>
            <address className="not-italic text-base text-muted">
              {footer.contact.lines.map((line, i) => (
                <p key={i}>{frenchTypography(line)}</p>
              ))}
              {footer.contact.phoneLabel && (
                <a
                  href={
                    footer.contact.phoneHref ||
                    `tel:${footer.contact.phoneLabel.replace(/\D/g, "")}`
                  }
                  className="inline-flex items-center min-h-11 text-primary hover:underline underline-offset-4 transition-colors"
                >
                  {frenchTypography(footer.contact.phoneLabel)}
                </a>
              )}
            </address>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm text-muted-soft">
            {frenchTypography(footer.bottomNote)}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
            <Link
              href="/mentions-legales"
              className="text-sm text-muted hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
              Mentions légales
            </Link>
            <p className="text-sm text-muted-soft">
              &copy; {new Date().getFullYear()} {brand.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
