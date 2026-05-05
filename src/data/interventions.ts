import { Intervention } from "@/types/intervention";

// Reference fixtures only — not used at runtime (Supabase is authoritative).
// Shows the new Section-based data model.
export const interventions: Intervention[] = [
  {
    id: "example-1",
    slug: "coronarographie",
    title: "Coronarographie",
    subtitle: "Examen d'imagerie des artères coronaires",
    status: "published",
    sections: [
      {
        id: "s-overview",
        type: "text",
        title: "Vue d'ensemble",
        body: "La coronarographie est un examen qui visualise les artères coronaires à l'aide d'un cathéter introduit par le poignet ou l'aine, guidé jusqu'au cœur sous contrôle radiologique.",
      },
      {
        id: "s-why",
        type: "text",
        title: "Pourquoi cette procédure ?",
        body: "Votre cardiologue peut proposer une coronarographie pour analyser l'apport sanguin du cœur en cas de douleur thoracique, test d'effort anormal, ou bilan post-infarctus.",
      },
      {
        id: "s-prep",
        type: "list",
        title: "Comment se préparer",
        ordered: true,
        items: [
          "Respectez les consignes de jeûne (6 à 8 heures).",
          "Signalez tous vos traitements, en particulier les anticoagulants.",
          "Indiquez toute allergie connue à l'iode ou aux produits de contraste.",
          "Prévoyez une personne pour vous raccompagner.",
        ],
      },
      {
        id: "s-risks",
        type: "list",
        title: "Risques",
        ordered: false,
        items: [
          "Hématome ou saignement au point de ponction",
          "Réaction allergique au produit de contraste",
          "Complications rares : arythmie, dissection coronaire",
        ],
      },
      {
        id: "s-faq",
        type: "faqs",
        title: "Questions fréquentes",
        faqs: [
          {
            id: "faq-1",
            question: "Combien de temps dure l'examen ?",
            answer: "L'examen dure habituellement entre 30 et 60 minutes.",
          },
          {
            id: "faq-2",
            question: "Vais-je être endormi ?",
            answer: "Vous restez éveillé, parfois avec une légère sédation. Une anesthésie locale est réalisée au point de ponction.",
          },
        ],
      },
    ],
    createdAt: "2025-03-20T10:00:00Z",
    updatedAt: "2025-03-20T14:30:00Z",
  },
];
