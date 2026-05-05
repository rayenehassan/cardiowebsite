export const dynamic = "force-dynamic";

import { Heart, ShieldCheck, BookOpen } from "lucide-react";
import InterventionCard from "@/components/ui/InterventionCard";
import { getPublishedInterventions } from "@/lib/interventions";

export default async function HomePage() {
  const interventions = await getPublishedInterventions();

  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 to-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Comprendre votre
            <span className="text-primary"> intervention cardiaque</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed mb-8">
            Votre cardiologue vous a proposé un geste de cardiologie
            interventionnelle. Ce site vous aide à comprendre ce qui vous attend
            avant, pendant et après l’intervention. Sélectionnez votre
            procédure ci-dessous pour en savoir plus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-secondary" />
              <span>Aucune donnée personnelle collectée</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary" />
              <span>Contenu rédigé par des cardiologues</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              <span>Information claire et accessible</span>
            </div>
          </div>
        </div>
      </section>

      <section id="interventions" className="py-12 sm:py-16 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Interventions disponibles
          </h2>
          <p className="text-muted mb-8">
            Sélectionnez l’intervention recommandée par votre cardiologue
            pour consulter les informations pratiques.
          </p>

          {interventions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">
                Aucune fiche publiée pour le moment
              </h3>
              <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
                Les fiches apparaîtront ici automatiquement dès qu’une
                intervention sera publiée depuis l’espace admin.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Information importante
          </h2>
          <p className="text-muted leading-relaxed">
            Ce site fournit des informations générales sur les procédures de
            cardiologie interventionnelle. Il ne remplace pas les explications
            personnalisées de votre cardiologue. Pour toute question concernant
            votre situation ou votre traitement, contactez directement votre
            équipe médicale.
          </p>
        </div>
      </section>
    </>
  );
}
