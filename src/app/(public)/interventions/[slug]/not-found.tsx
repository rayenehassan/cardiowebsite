import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Procédure introuvable
      </h1>
      <p className="text-muted mb-8">
        La procédure recherchee n’existe pas ou n’a pas encore ete publiée.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l’accueil
      </Link>
    </div>
  );
}
