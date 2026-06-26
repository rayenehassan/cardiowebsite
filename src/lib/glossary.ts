/**
 * Glossaire de termes médicaux courants en cardiologie interventionnelle.
 * Définitions volontairement courtes et adaptées au reading age 11 ans (NHS).
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossary: GlossaryTerm[] = [
  {
    term: "coronarographie",
    definition:
      "Examen radiologique qui permet de voir les artères du cœur grâce à un produit de contraste.",
  },
  {
    term: "angioplastie",
    definition:
      "Technique pour rouvrir une artère rétrécie ou bouchée à l'aide d'un petit ballon.",
  },
  {
    term: "stent",
    definition:
      "Petit ressort métallique placé dans une artère pour la maintenir ouverte.",
  },
  {
    term: "pacemaker",
    definition:
      "Petit appareil placé sous la peau qui aide le cœur à battre à un rythme normal.",
  },
  {
    term: "stimulateur cardiaque",
    definition:
      "Petit appareil placé sous la peau qui aide le cœur à battre à un rythme normal (autre nom du pacemaker).",
  },
  {
    term: "défibrillateur",
    definition:
      "Appareil qui peut rétablir un rythme cardiaque normal en délivrant un choc électrique.",
  },
  {
    term: "arythmie",
    definition: "Trouble du rythme du cœur — il bat trop vite, trop lentement ou irrégulièrement.",
  },
  {
    term: "fibrillation",
    definition:
      "Type d'arythmie où le cœur bat de façon désordonnée et rapide.",
  },
  {
    term: "fibrillation auriculaire",
    definition:
      "Trouble du rythme fréquent qui touche les oreillettes du cœur (les cavités du haut).",
  },
  {
    term: "ablation",
    definition:
      "Technique qui consiste à neutraliser une petite zone du cœur responsable d'un trouble du rythme.",
  },
  {
    term: "cathétérisme",
    definition:
      "Introduction d'un tube fin et souple dans un vaisseau sanguin pour atteindre le cœur.",
  },
  {
    term: "cathéter",
    definition: "Tube fin et souple introduit dans un vaisseau sanguin.",
  },
  {
    term: "électrocardiogramme",
    definition:
      "Examen indolore qui enregistre l'activité électrique du cœur grâce à des électrodes posées sur la peau.",
  },
  {
    term: "ECG",
    definition:
      "Électrocardiogramme : examen indolore qui enregistre l'activité électrique du cœur.",
  },
  {
    term: "holter",
    definition:
      "Petit appareil porté sur soi qui enregistre l'activité du cœur pendant 24 heures ou plus.",
  },
  {
    term: "anticoagulant",
    definition:
      "Médicament qui empêche le sang de coaguler trop facilement et évite la formation de caillots.",
  },
  {
    term: "héparine",
    definition:
      "Médicament anticoagulant souvent utilisé avant et pendant une intervention.",
  },
  {
    term: "thrombose",
    definition: "Formation d'un caillot de sang dans un vaisseau sanguin.",
  },
  {
    term: "infarctus",
    definition:
      "Blocage soudain d'une artère qui apporte le sang au cœur, ce qui endommage une partie du muscle cardiaque.",
  },
  {
    term: "artère coronaire",
    definition: "Artère qui apporte le sang et l'oxygène au muscle du cœur.",
  },
  {
    term: "valve cardiaque",
    definition:
      "Une des quatre « portes » du cœur qui s'ouvrent et se ferment pour faire circuler le sang dans le bon sens.",
  },
  {
    term: "TAVI",
    definition:
      "Remplacement de la valve aortique par un cathéter, sans ouvrir la poitrine.",
  },
  {
    term: "aorte",
    definition:
      "La plus grande artère du corps, qui part du cœur et distribue le sang vers tout l'organisme.",
  },
  {
    term: "ventricule",
    definition:
      "L'une des deux cavités du bas du cœur qui éjecte le sang vers le corps ou les poumons.",
  },
  {
    term: "oreillette",
    definition:
      "L'une des deux cavités du haut du cœur qui reçoit le sang.",
  },
  {
    term: "FEVG",
    definition:
      "Fraction d'éjection ventriculaire gauche : mesure de la force avec laquelle le cœur éjecte le sang.",
  },
  {
    term: "anesthésie locale",
    definition:
      "Médicament qui endort uniquement la zone à traiter — vous restez éveillé pendant l'examen.",
  },
  {
    term: "anesthésie générale",
    definition: "Médicament qui vous endort complètement pendant l'intervention.",
  },
  {
    term: "voie radiale",
    definition:
      "Accès par l'artère du poignet, souvent utilisé en coronarographie car moins contraignant.",
  },
  {
    term: "voie fémorale",
    definition: "Accès par l'artère du pli de l'aine.",
  },
];

const TERMS_BY_LENGTH = [...glossary].sort((a, b) => b.term.length - a.term.length);

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const LETTER = "A-Za-zÀ-ÖØ-öø-ÿ";

// Frontière de mot SANS lookbehind : on capture le séparateur de gauche dans un
// groupe (group 1). Raison : le lookbehind `(?<!…)` fait planter le module au
// chargement sur iOS Safari < 16.4 (iPhones anciens fréquents chez les 60+), ce
// qui casserait le glossaire/les FAQ. Group 2 = terme de base, group 3 = suffixe
// pluriel optionnel (« stent » → « stents », « pacemaker » → « pacemakers »).
const PATTERN = new RegExp(
  `(^|[^${LETTER}])(${TERMS_BY_LENGTH.map((t) => escapeRegex(t.term)).join("|")})(s|x)?(?![${LETTER}])`,
  "gi"
);

export interface TextSegment {
  type: "text" | "term";
  value: string;
  definition?: string;
}

/**
 * Découpe un texte en segments simples (texte brut + termes médicaux).
 * Un terme n'est jamais surligné deux fois dans le même bloc, pour ne pas alourdir
 * la lecture — on garde la première occurrence et on laisse les suivantes en clair.
 */
export function segmentMedicalText(text: string): TextSegment[] {
  if (!text) return [{ type: "text", value: "" }];

  const segments: TextSegment[] = [];
  const seen = new Set<string>();
  let lastIndex = 0;

  PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = PATTERN.exec(text)) !== null) {
    const lead = match[1] ?? ""; // séparateur de gauche capturé (hors terme)
    const base = match[2]; // terme du glossaire
    const suffix = match[3] ?? ""; // pluriel éventuel
    const whole = base + suffix;
    const termStart = match.index + lead.length;

    // Texte avant le terme (séparateur capturé inclus).
    if (termStart > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, termStart) });
    }

    const key = base.toLowerCase();
    const entry = glossary.find((g) => g.term.toLowerCase() === key);

    if (entry && !seen.has(key)) {
      seen.add(key);
      segments.push({ type: "term", value: whole, definition: entry.definition });
    } else {
      segments.push({ type: "text", value: whole });
    }

    lastIndex = termStart + whole.length;
    if (PATTERN.lastIndex <= match.index) PATTERN.lastIndex = lastIndex; // sécurité anti-boucle
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
