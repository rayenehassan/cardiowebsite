import { Activity, Check, ChevronDown } from "lucide-react";
import AnimateIn from "@/components/ui/AnimateIn";

type Item = { label?: string; text: string };
type Row = { title: string; text: string };

const WHO: Item[] = [
  { label: "Maladie coronaire", text: "après un infarctus ou un autre syndrome coronarien aigu, avec ou sans pose de stent ou pontage, ou si vous avez une maladie coronaire chronique (angine de poitrine)." },
  { label: "Insuffisance cardiaque", text: "chronique, récemment aggravée (décompensée), avancée avec une assistance ventriculaire (LVAD), ou après une greffe du cœur." },
  { label: "Maladie des valves", text: "surtout après un remplacement de la valve aortique, par chirurgie ou par voie percutanée (TAVI), mais aussi après une autre chirurgie valvulaire." },
];

const BENEFITS: Row[] = [
  { title: "Infarctus, syndrome coronarien aigu, maladie coronaire chronique", text: "Moins de décès d'origine cardiaque et moins de nouveaux infarctus. Moins d'hospitalisations. Une meilleure capacité à l'effort, un meilleur moral et une meilleure qualité de vie." },
  { title: "Insuffisance cardiaque chronique", text: "Moins d'hospitalisations, surtout en cas de cœur qui se contracte moins bien. Plus d'endurance et une meilleure qualité de vie." },
  { title: "Insuffisance cardiaque avec fraction d'éjection préservée", text: "Plus d'endurance et une meilleure qualité de vie, et probablement moins d'hospitalisations." },
  { title: "Insuffisance cardiaque récemment aggravée", text: "Une meilleure capacité de marche et une meilleure qualité de vie, si la réadaptation démarre dès que votre état le permet." },
  { title: "Assistance ventriculaire (LVAD) ou greffe cardiaque", text: "Une meilleure capacité à l'effort et à la marche." },
  { title: "Remplacement de la valve aortique (chirurgie ou TAVI)", text: "Une marche plus facile, plus d'autonomie dans la vie quotidienne, un meilleur moral et une meilleure qualité de vie." },
];

const TIMING: Row[] = [
  { title: "Après un infarctus ou un syndrome coronarien aigu", text: "Idéalement dans les 14 jours, au plus tard 30 jours après" },
  { title: "Après un pontage coronarien", text: "Dans les 28 jours, sans jamais dépasser 42 jours" },
  { title: "Après une insuffisance cardiaque aggravée", text: "Dès que le cœur est stabilisé, la congestion traitée, le traitement de fond débuté et la sortie d'hôpital envisageable" },
];

const TEAM = [
  "un cardiologue, qui garde la responsabilité médicale",
  "un infirmier spécialisé",
  "un kinésithérapeute ou un enseignant en activité physique",
  "un diététicien",
  "un psychologue",
  "une assistante sociale",
];

const EXERCISE: Item[] = [
  { label: "L'endurance", text: "vélo, tapis de marche ou autre appareil, plusieurs fois par semaine, par séances de 30 à 60 minutes en cas de maladie coronaire. En cas d'insuffisance cardiaque, les séances sont plus courtes au début, puis la durée augmente progressivement." },
  { label: "Le renforcement musculaire", text: "au moins deux fois par semaine. Il complète l'endurance et améliore l'effort que vous pouvez fournir." },
  { label: "La respiration", text: "en cas d'insuffisance cardiaque, un entraînement des muscles respiratoires peut s'ajouter." },
];

const WARNING_SIGNS = [
  "une douleur ou une oppression dans la poitrine",
  "un essoufflement inhabituel, ou qui s'aggrave depuis quelques jours",
  "un malaise, des palpitations",
  "en cas d'insuffisance cardiaque, une prise de poids rapide (plus de 1,8 kg en 1 à 3 jours)",
];

const OTHER_PARTS: Item[] = [
  { label: "Vos médicaments", text: "le programme est l'occasion de vérifier votre traitement, d'ajuster les doses et de vous expliquer à quoi sert chaque médicament. Une prise régulière compte autant que la prescription. N'arrêtez jamais un traitement de vous-même." },
  { label: "L'alimentation", text: "une alimentation de type méditerranéen est recommandée : fruits, légumes, céréales complètes, légumineuses, noix, poisson, huile d'olive. Il faut limiter le sel, les sucres ajoutés, les viandes rouges et transformées, et les graisses saturées. Un diététicien peut vous suivre, en particulier si vous devez perdre du poids ou si vous maigrissez sans le vouloir, ce qui peut arriver dans l'insuffisance cardiaque." },
  { label: "L'alcool", text: "moins vous en buvez, mieux c'est. L'ESC recommande de ne pas dépasser 100 g d'alcool pur par semaine." },
  { label: "Le poids", text: "en cas de surpoids ou d'obésité, l'équipe associe alimentation, activité physique et soutien. Certains traitements peuvent aider, et ils sont discutés avec votre médecin. On veille à préserver vos muscles pendant la perte de poids." },
  { label: "Le tabac", text: "arrêter de fumer fait baisser nettement le risque de décès chez les coronariens. L'équipe vous propose un accompagnement et, si besoin, des médicaments d'aide au sevrage (substituts nicotiniques, varénicline, bupropion, cytisine). La cigarette électronique est à éviter : le but est d'arrêter toute nicotine." },
  { label: "Le moral", text: "environ une personne sur trois ressent de l'anxiété ou de la dépression après un événement cardiaque. Un dépistage est proposé, ainsi qu'un soutien : écoute, thérapies cognitivo-comportementales, méditation de pleine conscience, groupes de parole." },
  { label: "La vie intime", text: "les troubles de la sexualité sont fréquents chez les patients cardiaques, hommes et femmes, et la peur d'une rechute est courante. Vous pouvez en parler sans gêne : quand reprendre, quels signes doivent vous arrêter, les effets des médicaments. L'activité physique régulière aide aussi." },
  { label: "Le travail", text: "le programme combine exercice et accompagnement pour faciliter la reprise professionnelle, surtout si vous êtes jeune. Parlez de votre métier à l'équipe, afin qu'elle adapte les exercices." },
  { label: "Votre environnement", text: "pollution de l'air, bruit, chaleur extrême : l'équipe peut vous donner des conseils pour limiter ces risques, par exemple éviter l'effort en plein pic de pollution ou aux heures les plus chaudes." },
];

const PLACES: Row[] = [
  { title: "En centre (hôpital ou structure de proximité)", text: "Vous venez aux séances avec l'équipe. C'est le mode de référence, recommandé pour tous les patients ayant une indication." },
  { title: "En hospitalisation", text: "Réservée aux situations plus fragiles ou instables : complications après un infarctus ou une chirurgie, insuffisance cardiaque avancée, perfusions ou assistance, greffe récente." },
  { title: "À domicile, avec suivi numérique (télé-réadaptation)", text: "Vous faites les exercices chez vous. L'équipe vous suit par visio, téléphone ou application. Elle peut être une alternative à la réadaptation en centre en cas de maladie coronaire ou d'insuffisance cardiaque." },
  { title: "Formule mixte (hybride)", text: "Vous combinez des séances en centre et des séances à distance." },
  { title: "À domicile, sans outil numérique", text: "Contacts téléphoniques et documents. Option possible si votre risque n'est pas élevé." },
];

const AFTER: Item[] = [
  { label: "Restez actif", text: "visez 150 à 300 minutes par semaine d'activité d'intensité modérée (marche rapide, vélo), ou 75 à 150 minutes d'activité plus intense. Ajoutez du renforcement musculaire au moins deux jours par semaine." },
  { label: "Bougez plus, restez moins assis", text: "même 500 à 1 000 pas de plus par jour sont associés à un moindre risque de décès et d'événement cardiaque. Un podomètre ou une montre connectée peut vous motiver." },
  { label: "Intégrez l'activité à votre quotidien", text: "marcher plutôt que conduire pour les courts trajets, prendre les escaliers, jardiner, danser." },
  { label: "Gardez du soutien", text: "famille, groupe d'activité ou de pairs, rendez-vous de suivi réguliers avec votre équipe." },
  { label: "Il n'est jamais trop tard", text: "même après un événement cardiaque, adopter un mode de vie actif reste bénéfique." },
];

const FAQ: Row[] = [
  { title: "Je suis âgé(e) ou fragile : est-ce pour moi ?", text: "Oui. Les personnes âgées en tirent un vrai bénéfice : meilleure condition physique, moral, autonomie, moins de réhospitalisations. Les exercices sont adaptés, plus doux et plus progressifs. Un suivi à domicile ou en formule mixte peut faciliter la participation." },
  { title: "J'ai d'autres maladies (diabète, poumons, reins, articulations, cancer…).", text: "Elles ne vous excluent pas. L'équipe adapte le programme et se coordonne avec vos autres spécialistes." },
  { title: "Je suis une femme : y a-t-il des programmes adaptés ?", text: "Les femmes participent moins souvent, souvent à cause des contraintes familiales, du transport ou du manque d'information. Des horaires souples, un soutien psychologique et des formules à distance peuvent aider. N'hésitez pas à demander." },
  { title: "Je suis jeune et je travaille.", text: "La réadaptation peut vous aider à reprendre le travail. Des formules à distance ou à horaires adaptés existent." },
  { title: "Que faire si je ressens quelque chose pendant l'effort ?", text: "Arrêtez l'effort et prévenez l'équipe. En dehors d'une séance, une douleur dans la poitrine qui ne cesse pas au repos, un malaise ou une gêne respiratoire intense justifient d'appeler le 15 (ou le 112)." },
];

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
      {children}
    </h3>
  );
}

function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`text-base sm:text-lg leading-relaxed mb-3 ${muted ? "text-muted" : "text-foreground"}`}>
      {children}
    </p>
  );
}

function CheckList({ items }: { items: Item[] }) {
  return (
    <ul className="space-y-3 mb-3">
      {items.map((item) => (
        <li key={item.label ?? item.text} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-foreground">
          <Check className="w-5 h-5 mt-1 shrink-0" style={{ color: "#0369A1" }} aria-hidden="true" />
          <span>
            {item.label && <span className="font-bold">{item.label} : </span>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RowCards({ rows }: { rows: Row[] }) {
  return (
    <div className="space-y-3 mb-3">
      {rows.map((row) => (
        <div
          key={row.title}
          className="rounded-2xl border p-4 sm:p-5"
          style={{ background: "#F8FAFF", borderColor: "rgba(15,23,42,0.08)" }}
        >
          <p className="text-base sm:text-lg font-bold text-foreground">{row.title}</p>
          <p className="text-base text-muted mt-1">{row.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function CardiacRehabSection() {
  return (
    <section className="py-8 sm:py-12 lg:py-14" style={{ background: "#F8FAFF" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div id="readaptation" className="scroll-mt-24" aria-hidden="true" />
        <AnimateIn className="mb-5 sm:mb-8">
          <span className="section-label mb-4 sm:mb-5 inline-flex">
            <Activity className="w-3.5 h-3.5" />
            <span className="section-label-text">Fiche patient</span>
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Réadaptation cardiaque
          </h2>
          <p className="text-muted text-base sm:text-lg mt-4">
            Retrouver confiance et protéger son cœur
          </p>
        </AnimateIn>

        <details className="group rounded-2xl border bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
          <summary
            className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden"
            style={{ background: "#F8FAFF", minHeight: "44px" }}
          >
            <span className="flex-1 group-open:hidden">Lire la fiche</span>
            <span className="hidden flex-1 group-open:inline">Masquer la fiche</span>
            <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#0369A1" }} aria-hidden="true" />
          </summary>
          <div className="space-y-10 p-4 sm:p-6">
            <AnimateIn>
              <P>
                La réadaptation cardiaque est un programme encadré par une équipe de soignants, qui vous aide à reprendre des forces, à retrouver confiance et à réduire le risque d&apos;un nouveau problème cardiaque.
              </P>
              <H3>Qu&apos;est-ce que la réadaptation cardiaque ?</H3>
              <P>
                Ce n&apos;est pas seulement du sport. Le programme associe un réentraînement à l&apos;effort progressif, des conseils sur vos médicaments, votre alimentation et l&apos;arrêt du tabac, ainsi qu&apos;un soutien pour le moral. Tout est adapté à votre maladie, à votre âge et à vos envies.
              </P>
              <P>
                La Société européenne de cardiologie (ESC) a publié en 2026 ses premières recommandations entièrement consacrées à la réadaptation cardiaque. Cette fiche en reprend l&apos;essentiel pour vous.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>Pour qui ?</H3>
              <P>La réadaptation cardiaque est recommandée dans la plupart des maladies du cœur, et en particulier si vous êtes dans l&apos;une de ces situations :</P>
              <CheckList items={WHO} />
              <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "#F0F9FF", borderColor: "rgba(3,105,161,0.2)" }}>
                <p className="text-base sm:text-lg leading-relaxed text-foreground">
                  <span className="font-bold">À retenir :</span> l&apos;âge, la fragilité ou d&apos;autres maladies ne sont pas des raisons de renoncer. Les recommandations de l&apos;ESC indiquent clairement qu&apos;on ne doit pas priver un patient de réadaptation pour ces motifs. Le programme est simplement adapté à votre état.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn>
              <H3>Ce que vous pouvez en attendre</H3>
              <P>Les bénéfices dépendent de votre maladie. Voici ce que montrent les études analysées par l&apos;ESC.</P>
              <RowCards rows={BENEFITS} />
              <P>
                La réadaptation améliore aussi la confiance en soi. Beaucoup de patients ont peur de leur corps après un événement cardiaque. Reprendre l&apos;effort avec une équipe aide à retrouver cette confiance.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>Quand commencer ?</H3>
              <P>
                Plus la réadaptation démarre tôt, mieux c&apos;est. Votre équipe vérifie d&apos;abord que vous pouvez faire de l&apos;exercice en sécurité, notamment grâce à un test d&apos;effort.
              </P>
              <RowCards rows={TIMING} />
              <P>
                Même si l&apos;exercice doit attendre, le reste du programme peut commencer tout de suite : conseils diététiques, soutien psychologique, aide pour arrêter de fumer et ajustement de vos médicaments.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>Comment se déroule un programme ?</H3>
              <P>
                Un programme compte au minimum 24 séances, en général réparties sur 12 semaines, à raison de deux séances par semaine. Les études montrent que plus on participe, plus le bénéfice est grand.
              </P>
              <P>
                <span className="font-bold">1. Un bilan de départ.</span> L&apos;équipe fait le point sur votre histoire médicale, vos habitudes de vie et votre moral. Elle réalise un examen clinique, un électrocardiogramme, une prise de sang, souvent une échographie du cœur et un test d&apos;effort. Des questionnaires recueillent votre ressenti.
              </P>
              <P>
                <span className="font-bold">2. Des objectifs personnalisés.</span> Vous les définissez avec l&apos;équipe : reprendre le travail, retrouver vos loisirs, monter les escaliers sans peine, porter vos courses.
              </P>
              <P>
                <span className="font-bold">3. Une équipe autour de vous.</span> Selon les centres, elle réunit :
              </P>
              <CheckList items={TEAM.map((text) => ({ text }))} />
              <P>
                <span className="font-bold">4. Des séances variées.</span> Exercice physique, éducation thérapeutique, conseils nutritionnels, ateliers pour le moral ou pour arrêter de fumer, selon vos besoins.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>L&apos;activité physique : ce qu&apos;on y fait, et en sécurité</H3>
              <P>L&apos;exercice est le cœur du programme. Il améliore votre endurance et votre force, ce qu&apos;aucun médicament ne fait seul.</P>
              <CheckList items={EXERCISE} />
              <P>
                L&apos;intensité est réglée d&apos;après votre test d&apos;effort, puis ajustée selon votre ressenti. Un repère simple est de pouvoir encore parler pendant l&apos;effort. Elle augmente progressivement, à mesure que vous progressez.
              </P>
              <P>
                <span className="font-bold">Est-ce dangereux ?</span> Le risque est faible quand l&apos;exercice est adapté et encadré. Les accidents graves liés à l&apos;exercice sont rares dans les programmes de réadaptation. Si votre situation à risque le justifie, votre équipe peut surveiller votre rythme cardiaque pendant la séance ou choisir des intensités plus basses.
              </P>
              <P>
                <span className="font-bold">Vous avez peur de faire un effort ?</span> C&apos;est fréquent après un événement cardiaque. Une reprise progressive et supervisée aide justement à voir que l&apos;activité est sûre et que vous pouvez la gérer.
              </P>
              <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "#FFF5F7", borderColor: "rgba(244,63,94,0.15)" }}>
                <p className="font-bold text-foreground mb-3">Signalez à l&apos;équipe, avant ou pendant une séance :</p>
                <ul className="space-y-2">
                  {WARNING_SIGNS.map((sign) => (
                    <li key={sign} className="text-base leading-relaxed text-foreground">{sign}</li>
                  ))}
                </ul>
              </div>
            </AnimateIn>

            <AnimateIn>
              <H3>Les autres volets du programme</H3>
              <P>La réadaptation ne se limite pas à l&apos;exercice. Chaque volet renforce les autres.</P>
              <CheckList items={OTHER_PARTS} />
            </AnimateIn>

            <AnimateIn>
              <H3>Où faire sa réadaptation ?</H3>
              <P>
                Le choix se fait avec vous, selon votre état de santé, vos préférences, votre vie quotidienne et ce qui existe près de chez vous.
              </P>
              <RowCards rows={PLACES} />
              <P>
                Quel que soit le mode, le bilan de départ et le test d&apos;effort se font en personne, et une équipe dédiée dirige toujours le programme.
              </P>
              <P>
                Si vous avez une insuffisance cardiaque, la téléconsultation avec télésurveillance (poids, tension, symptômes) peut aussi réduire les hospitalisations et la mortalité d&apos;origine cardiaque à court terme.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>Après le programme : garder les bénéfices</H3>
              <P>Le but de la réadaptation est de vous donner les moyens de rester en bonne santé sur le long terme. Les progrès se perdent si l&apos;on arrête tout.</P>
              <CheckList items={AFTER} />
              <P>
                Si vous vivez avec une insuffisance cardiaque, il peut aussi être utile d&apos;aborder, tant que vous allez bien, ce qui compte le plus pour vous (autonomie, confort, sécurité) et la personne de confiance qui pourrait parler en votre nom.
              </P>
            </AnimateIn>

            <AnimateIn>
              <H3>Questions fréquentes</H3>
              <RowCards rows={FAQ} />
            </AnimateIn>

            <AnimateIn>
              <div className="rounded-2xl border p-4 sm:p-5 flex items-center gap-4" style={{ background: "#FFF5F7", borderColor: "rgba(244,63,94,0.3)" }}>
                <span className="text-3xl font-bold" style={{ color: "#DC2626", fontFamily: "var(--font-heading)" }}>15</span>
                <p className="text-base sm:text-lg leading-relaxed text-foreground">
                  <span className="font-bold">En cas d&apos;urgence cardiaque</span>, composez le 15 (Samu), gratuit, 24 h/24.
                </p>
              </div>
              <p className="text-base leading-relaxed text-foreground mt-4">
                <span className="font-bold">Pour en parler :</span> parlez-en à votre cardiologue ou à l&apos;équipe de réadaptation. Cardiologie interventionnelle de la Loire, Hôpital privé de la Loire, 39 bd de la Palle, 42100 Saint-Étienne.
              </p>
              <p className="text-sm text-muted mt-4">
                Cette fiche est une information générale. Elle ne remplace pas l&apos;avis de votre médecin, qui adapte le programme à votre situation.
              </p>
              <p className="text-sm text-muted mt-2">
                Source : recommandations 2026 de l&apos;ESC sur la réadaptation cardiaque, Bäck M, Wilhelm M, Hansen D et coll., European Heart Journal 2026;47:5631-5729.{" "}
                <a
                  href="https://doi.org/10.1093/eurheartj/ehag099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#0369A1" }}
                >
                  doi:10.1093/eurheartj/ehag099
                </a>
              </p>
            </AnimateIn>
          </div>
        </details>
      </div>
    </section>
  );
}
