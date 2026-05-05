import Link from "next/link";
import { Activity } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="mt-auto border-t"
      style={{ background: "#F8FAFF", borderColor: "rgba(0,0,0,0.07)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div
              className="flex items-center gap-2.5 mb-4"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "17px", color: "#0F172A" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(2,132,199,0.09)", border: "1px solid rgba(2,132,199,0.18)" }}
              >
                <Activity className="w-4 h-4" style={{ color: "#0284C7" }} />
              </div>
              Cardio<span style={{ color: "#0284C7" }}>Info</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Plateforme d&apos;information pré-interventionnelle pour les patients de
              cardiologie. Ces informations ne remplacent pas l&apos;avis de votre cardiologue.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3
              className="text-sm font-semibold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Liens rapides
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted hover:text-foreground transition-colors"
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
              className="text-sm font-semibold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact
            </h3>
            <div className="text-muted text-sm space-y-2">
              <p>Service de cardiologie</p>
              <p>Tél. : +32 (0)2 123 45 67</p>
              <p>cardio@hospital-example.be</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <p className="text-xs text-muted">
            Ce site ne collecte aucune donnée, n&apos;utilise pas de cookies et ne suit pas les visiteurs.
          </p>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} CardioInfo
          </p>
        </div>
      </div>
    </footer>
  );
}
