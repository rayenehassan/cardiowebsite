import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Heart className="w-5 h-5" fill="currentColor" />
              <span>CardioInfo</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Plateforme d’information pré-interventionnelle pour les patients
              de cardiologie interventionnelle. Ces informations générales ne
              remplacent pas l’avis médical de votre cardiologue.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Liens rapides</h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/#interventions"
                  className="hover:text-white transition-colors"
                >
                  Interventions
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div id="contact">
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="text-blue-200 text-sm space-y-1">
              <p>Service de cardiologie</p>
              <p>Tél. : +32 (0)2 123 45 67</p>
              <p>E-mail : cardio@hospital-example.be</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300 text-xs">
          <p>
            Ce site ne collecte aucune donnée personnelle, n’utilise pas de
            cookies et ne suit pas les visiteurs.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} CardioInfo. Informations
            générales uniquement.
          </p>
        </div>
      </div>
    </footer>
  );
}
