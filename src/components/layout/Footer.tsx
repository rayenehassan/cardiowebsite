import Link from "next/link";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#interventions", label: "Interventions" },
  { href: "/#equipe", label: "Équipe" },
];

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "#F8FAFF", borderColor: "rgba(0,0,0,0.07)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true" className="flex-shrink-0">
                <rect x="0"  y="0"  width="13" height="13" rx="1" fill="#0284C7"/>
                <rect x="17" y="0"  width="13" height="13" rx="1" fill="#0284C7"/>
                <rect x="0"  y="17" width="13" height="13" rx="1" fill="#0284C7"/>
                <polygon points="17,17 30,17 17,30" fill="#0284C7"/>
              </svg>
              <div className="leading-tight">
                <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  Ramsay Santé
                </p>
                <p className="text-xs text-muted" style={{ fontFamily: "var(--font-heading)" }}>
                  Hôpital Privé de la Loire
                </p>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Plateforme d&apos;information sur les procédures pratiquées par l&apos;équipe
              de cardiologie interventionnelle de l&apos;Hôpital Privé de la Loire.
            </p>
          </div>

          {/* Liens rapides */}
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
              <p>Hôpital Privé de la Loire</p>
              <p>Saint-Étienne, France</p>
              <p>Tél. : 04 78 22 91 12</p>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div
          className="mt-8 sm:mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <p className="text-xs text-muted">
            Ce site ne collecte aucune donnée, n&apos;utilise pas de cookies et ne suit pas les visiteurs.
          </p>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Ramsay Santé · Hôpital Privé de la Loire
          </p>
        </div>
      </div>
    </footer>
  );
}
