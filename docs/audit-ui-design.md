# Audit UI — sortir le site public de l'esthétique « générée par IA »

Date : 18 août 2026. Branche de référence : `fix/audit-6-7-8-9-11`.
Périmètre : site public uniquement (accueil, fiche intervention, chrome).
**Statut : proposition. Rien n'est appliqué.**

Version illustrée (maquettes avant/après rendues) :
<https://claude.ai/code/artifact/1ebe1f77-7976-427f-b9d4-b735d2ad7dbc>

Voir aussi `docs/audit-corrections.md` et `docs/audit-corrections-2.md` (audits
fonctionnels précédents — sujet différent).

---

## 1. Diagnostic

Le site n'a pas un problème de goût, il a un problème d'**origine visible** :
chaque écran affiche la signature par défaut des outils de génération, et le
patient la lit avant de lire le contenu.

Cause racine : **il n'y a pas de système, il y a un empilement**. `globals.css`
définit 13 tokens de couleur ; le reste du site les ignore et écrit des
hexadécimaux à la main dans des attributs `style={{…}}`. La police de titre est
déclarée dans le thème puis ré-imposée en ligne 42 fois. C'est la trace d'une
construction écran par écran, sans passe de synthèse.

### Mesures

Comptage sur `src/app/(public)`, `src/components/ui`, `src/components/layout`,
`src/app/globals.css` :

| Dimension | Actuel | Cible | Effet produit |
|---|---:|---:|---|
| Couleurs codées en dur | 24 | 0 | Aucune cohérence chromatique perceptible |
| Tailles de texte distinctes | 21 | 7 | Hiérarchie molle, tout se vaut |
| Ombres portées distinctes | 7 | 1 | Profondeurs incohérentes d'un bloc à l'autre |
| Rayons d'angle | 4 | 1 | Aucun ne domine → aucun ne signifie |
| Blocs `style={{…}}` | 156 | ~10 | Le thème existe mais ne gouverne rien |
| `var(--font-heading)` en ligne | 42 | 0 | Répétition mécanique, jamais une décision |

Commandes de re-mesure :

```bash
cd src
grep -rhoE "#[0-9A-Fa-f]{6}" app/\(public\) components/ui components/layout app/globals.css | tr 'a-f' 'A-F' | sort -u | wc -l
grep -rhoE "text-(xs|sm|base|lg|xl|[2-6]xl|\[[0-9.]+(px|rem)\])" app/\(public\) components/ui components/layout | sort -u | wc -l
grep -rc "style={{" app/\(public\) components/ui components/layout --include="*.tsx"
```

Un visiteur juge la crédibilité d'une page en ~50 ms. Sur un site médical ce
jugement porte sur le sérieux **du service**, pas du site. Le décor coûte donc de
la confiance médicale, pas seulement des points de style.

---

## 2. Les 16 constats

Sévérité : **B** bloquant · **M** majeur · **m** mineur.

### 01 — B — Fond mesh-gradient du hero
`src/app/globals.css:52-61` — commentaire d'origine : « Mesh gradient — même
technique que Sloan, 4 ellipses, palette bleue ».
Quatre ellipses radiales pastel bleu/indigo/cyan sur blanc. Marqueur n°1 de
toutes les listes 2026, sans exception.
**→ Fond uni.** Blanc papier légèrement chaud (`#FBFAF8`). Zéro dégradé
décoratif sur tout le site.

### 02 — B — Dégradé sur le titre H1
`src/app/(public)/page.tsx:64-71` · `src/lib/site-defaults.ts:19-21`
(`#FB7185` → `#E11D48`).
`-webkit-text-fill-color: transparent` sur le titre : le motif le plus associé
aux pages générées. Sur un site de santé, un titre rose dégradé contredit aussi
le registre.
**→ Titre d'une seule encre.** Emphase par le poids ou le retour à la ligne. Les
champs `highlightColor1` / `highlightColor2` / `highlightGradient` sortent du
modèle éditorial (`src/types/site.ts`, `SiteContentForm.tsx`).

### 03 — B — Pastille en capitales au-dessus du titre
`src/app/globals.css:90-115` (`.section-label`) — 5 occurrences sur l'accueil.
`border-radius: 100px`, 13px, `letter-spacing: .08em`, majuscules, icône à
gauche, fond bleu à 8 %. Le « badge above hero H1 » est listé nommément comme
motif de sortie de fabrique ; ici il est répété au-dessus de chaque section.
**→ Suppression.** Le rôle réel est de donner un contexte de lieu : une ligne de
texte le fait mieux (« Hôpital privé de la Loire — Saint-Étienne », petit corps,
souligné d'un filet 1px).

### 04 — B — Inter + Space Grotesk
`src/app/layout.tsx:2-15` · `src/app/globals.css:18-19`.
Inter est la police par défaut de quasiment tous les outils de génération, et le
couple Inter + Space Grotesk est cité explicitement comme combinaison signature.
Space Grotesk est de plus une grotesque géométrique de startup — elle ne dit rien
d'hospitalier.
**→ Voir §4, Typographie.** Changement à plus fort rendement du dossier.

### 05 — B — Apparitions en fondu au défilement, partout
`src/components/ui/AnimateIn.tsx` · `page.tsx` (12 usages, décalages `i*75` et
`i*100`).
Chaque bloc monte de 28px en 750 ms, les cartes en cascade. Mouvement sans
fonction. Deux effets secondaires : pour un patient de 65 ans le contenu « fuit »
à la lecture, et **`prefers-reduced-motion` n'est pas respecté par ce composant**.
**→ Retrait complet de `AnimateIn` de l'accueil.** Contenu présent au chargement.
Mouvement réservé au retour d'action (ouverture d'un volet, état d'un bouton,
envoi dans le chat), ≤ 200 ms.

### 06 — B — Tout est une carte arrondie avec une barre de couleur
`src/app/(public)/interventions/[slug]/page.tsx:128-200` (`SectionCard`) et
`:44-50` (`sectionAccent`).
Chaque section devient une carte blanche `rounded-2xl`, ombre douce, en-tête
teinté, barre verticale colorée. **La couleur alterne selon la parité de
l'index** (bleu / rouge / bleu…, ambre pour les FAQ) : une couleur qui dépend
d'un numéro de position ne transporte aucune information — décoration déguisée en
sémantique. La « barre d'accent sur carte arrondie » est au catalogue des motifs
à éviter.
**→ La fiche redevient un document.** Sections séparées par un filet 1px et du
blanc, titres portés par la typographie. Zéro carte, zéro ombre, zéro couleur
rotative. Les cartes restent là où elles ont un sens : une fiche dans une liste
est un objet cliquable, donc une carte.

### 07 — M — Glassmorphism et flou d'arrière-plan
`src/app/globals.css:63-80` (`.glass`) · `[slug]/page.tsx:385`
(`bg-white/80 backdrop-blur-sm`).
`backdrop-filter: blur(20px)` sur fond translucide : esthétique d'OS mobile 2021,
aujourd'hui marqueur de template. Sur les « informations clés » de la fiche, le
flou dégrade en plus le contraste d'un contenu à lire vite.
**→ Fonds opaques.** Les quatre `quickFacts` deviennent un tableau à filets,
lisible et imprimable.

### 08 — M — Boutons pilule à halo
`src/app/globals.css:117-124` (`.glow-btn`), `:186-226` (`border-radius: 100px`).
`box-shadow: 0 4px 20px` diffus sous un bouton entièrement arrondi : vocabulaire
SaaS. Une institution de santé utilise des boutons rectangulaires, nets, à fort
contraste.
**→ Rayon 3px, aucune ombre, bleu institutionnel plein.** Hauteur 48px conservée.

### 09 — M — Micro-labels en capitales espacées
`InterventionSidebarNav.tsx:90,109` (« SUR CETTE PAGE ») ·
`InterventionSearch.tsx:155` (« SUGGESTIONS ») · `[slug]/page.tsx:396` (libellés
`quickFacts`).
`text-[13px] uppercase tracking-wider` répété comme réflexe. En français, les
capitales espacées dégradent aussi la lisibilité des accents pour un lectorat âgé.
**→ Bas de casse, 13px, gris moyen.** Un filet au-dessus si séparation nécessaire.

### 10 — M — L'icône dans son carré arrondi, en boucle
`page.tsx:206,276` · `InterventionSearch.tsx:54,120` · `[slug]/page.tsx:290,387`
· `Footer.tsx:34` — 8 occurrences.
Toujours le même objet : `w-10 h-10 rounded-xl`, fond bleu à 8 %, bordure bleue à
16 %, icône `lucide` au centre. ADN de la carte-fonctionnalité générée, recyclé
même là où l'icône n'ajoute rien (le champ de recherche a déjà un placeholder
explicite).
**→ Icônes uniquement quand elles portent une information non redondante**
(téléphone, téléchargement, urgence), sans conteneur : trait seul, à la taille du
texte, dans la couleur du texte.

### 11 — M — Le trio de points de réassurance à icônes
`page.tsx:28-32` (`ENVIRONMENT_POINTS`) — et le `// TODO copy` ligne 27.
« Une équipe à vos côtés / Un plateau technique dédié / Une surveillance
continue » : trois éléments, trois icônes, formulations interchangeables avec
n'importe quel établissement de France. **Le commentaire
`// TODO copy : à faire valider par le médecin` est encore dans le fichier** —
texte de remplissage assumé, livré en production.
**→ Faire écrire ces trois lignes par le médecin**, avec des éléments vérifiables
(nombre de salles, horaires de surveillance, qui appelle le patient la veille).
Ou les supprimer : la photo réelle du cath-lab fait déjà le travail.

### 12 — B — La copie ne pourrait être signée par personne
`src/lib/site-defaults.ts:22-24, 44-46` · `page.tsx:268-272`.
« pour vous préparer sereinement », « à votre écoute », « L'appréhension vient
souvent de l'inconnu », « une équipe vous accompagne à chaque étape ». Aucune de
ces phrases ne contient un fait. C'est le registre décrit comme signature :
rassurance sans engagement. C'est **là** que l'humain se voit ou pas, plus encore
que dans le CSS.
**→ Voir §5, La voix.**

### 13 — M — Le hero occupe un écran entier pour un bouton
`page.tsx:46` — `min-h-[85svh] sm:min-h-screen`.
Un patient arrive avec un mot précis donné par son cardiologue et doit franchir
100 % de hauteur d'écran de décor avant d'atteindre les fiches. Réflexe de page
marketing, pas de service d'information.
**→ Hauteur dictée par le contenu (~420px).** Recherche et premières fiches
visibles sans défiler. Une seule voie d'accès au lieu de trois (recherche +
grille + « voir toutes les fiches »).

### 14 — M — Le logo ne dit rien de médical ni de Ramsay
`Header.tsx:68-73` · `Footer.tsx:61-66`.
Trois carrés et un triangle. Marque abstraite générique. Le client réel est
Ramsay Santé / Hôpital privé de la Loire, groupe qui possède une identité
déposée : ne pas l'utiliser affaiblit deux fois — ni marque du client, ni marque
propre.
**→ Demander le kit de marque Ramsay Santé et l'appliquer.** À défaut : plus de
pictogramme du tout, uniquement le nom composé (norme des établissements
français).

### 15 — m — Deux entrées pour un seul assistant
`Header.tsx:116-126` (« Questions ? ») · `ChatWidget.tsx` (bulle flottante).
Le bouton d'en-tête et la bulle ouvrent le même panneau. Redondance d'ajouts
successifs ; la bulle recouvre en plus le contenu sur mobile.
**→ Une entrée.** Bulle sur la fiche intervention (là où les questions
naissent), bouton d'en-tête sur l'accueil. Jamais les deux ensemble.

### 16 — B — Aucune trace de fabrication humaine
Absent partout — alors que `updatedAt` existe déjà dans `src/types/intervention.ts`.
Aucune date de mise à jour, aucun nom de relecteur, aucune source citée. Or les
documents GACI sont déjà ingérés (RAG) et trois cardiologues sont déjà nommés et
photographiés dans `public/`. **La preuve concrète est le seul signal qu'une
machine ne peut pas fabriquer — et c'est celui qui manque.**
**→ Bas de chaque fiche :** « Mise à jour le 4 juin 2026 · Relue par le Dr
Mustapha Hassan · D'après la fiche GACI Coronarographie ». Trois lignes qui font
plus pour la crédibilité que tout le reste de ce document.

---

## 3. Contre-modèle : ce que fait un vrai site de santé

La référence n'est pas une startup santé, c'est un service public d'information
médicale (NHS digital service manual, ameli, HAS). Quatre traits, aucun n'est un
effet :

- **Le texte est gros et gouverne tout.** Le NHS pose 19px de corps sur grand
  écran, tout aligné à gauche, italiques et soulignés réservés aux liens, mesure
  de lecture tenue.
- **La couleur ne décore jamais.** Un bleu de marque, un rouge d'urgence, un
  jaune d'avertissement. Un emploi unique et exclusif par teinte.
- **Les surfaces sont plates.** Filets 1px, pas d'ombres, angles quasi droits. Ce
  qui structure, c'est l'espace vertical et la graisse du titre.
- **La page assume d'être un document.** Elle s'imprime, se cite, porte une date.

### À ne pas casser

Le site fait déjà plusieurs choses justes : cibles tactiles 44px,
`focus-visible` global, feuille de style d'impression (`globals.css:295-304`),
photos réelles des trois cardiologues et du cath-lab, glossaire au survol,
absence totale de cookies. Ce sont des décisions de fond. Le décor les cache.

---

## 4. Le système de remplacement

### Typographie — décision principale

Sortir d'Inter + Space Grotesk pour une **superfamille** : un serif de lecture
pour titres et texte long, son sans compagnon pour libellés et données. Une
superfamille se voit : c'est une décision, pas un tirage. Les deux sont sur
Google Fonts (compatibles `next/font/google`).

| Rôle | Actuel | Proposé | Pourquoi |
|---|---|---|---|
| Titres, texte long | Space Grotesk | **Source Serif 4** | Serif de lecture Adobe pensé pour l'écran. Registre revue médicale / brochure hospitalière. Aucun outil ne le sort par défaut. |
| Libellés, données, UI | Inter | **Source Sans 3** | Même superfamille : proportions et rythme accordés. Lisible en petit corps. |
| Corps de base | 16px | **18px** | Public 60+, aligné sur la pratique des services publics de santé. |

Variante si le serif est jugé trop marqué par le médecin : **Public Sans**
(design system de l'administration américaine) en corps, Source Serif 4 conservé
pour les seuls titres. Le registre reste institutionnel.

### Couleur — 10 jetons, zéro hexadécimal dans le TSX

```css
/* fonds — blanc papier légèrement chaud, pas de bleu dans les gris */
--paper:      #FBFAF8;
--paper-alt:  #F4F2ED;
--rule:       #DCD8D0;   /* filet 1px, remplace toutes les ombres */

/* encres */
--ink:        #16191E;
--ink-soft:   #4A515B;
--ink-mute:   #6B727C;

/* sémantique — un emploi et un seul par teinte */
--brand:      #1B4F72;   /* liens, navigation, action primaire */
--urgent:     #A0342A;   /* uniquement le 15 / SAMU */
--warn:       #9A6B1E;   /* uniquement une consigne à ne pas manquer */

/* supprimés : #6366F1 #38BDF8 #F43F5E #E11D48 #D97706 #0EA5E9
   #EEF4FF #F8FAFF #FFF5F7 #F0F6FF — 24 hex → 10 jetons */
```

**Détail décisif :** les gris actuels sont bleutés (`#F8FAFF`, `#EEF4FF`). Un gris
bleuté lit « interface tech ». Un gris légèrement chaud lit « papier ». C'est un
déplacement de deux points de teinte, et il change tout le registre.

### Surfaces et mouvement

| | Actuel | Proposé |
|---|---|---|
| Rayon | 4 valeurs mélangées, jusqu'à 100px | **3px**, une seule valeur, partout |
| Ombres | 7 recettes différentes | **aucune** — sauf le panneau de chat (surimpression) |
| Séparation | ombre + fond teinté + bordure | **filet 1px** + espace vertical |
| Survol carte | `translateY(-4px)` + halo bleu | bordure qui fonce, titre souligné |
| Échelle de type | 21 tailles | **7** : 13 / 15 / 18 / 21 / 26 / 34 / 46 |
| Mouvement | fondus au défilement partout | retour d'action uniquement, ≤ 200 ms |

### Le tracé ECG : garder, désamorcer

`page.tsx:22-24` (`ECG_PATH`) + `globals.css:276-293`. C'est la seule idée
réellement originale du site — chemin SVG écrit à la main, quatre cycles P-QRS-T,
issu du sujet lui-même. Mais l'exécution est décorative : dégradé bleu-cyan, halo
flouté 8px, segment lumineux en boucle 16 s.

**→ Garder le tracé, retirer l'effet :** trait unique 1,5px, encre bleu
institutionnel, sans dégradé, sans flou, sans animation. Il devient une signature
graphique — la marque d'un service de cardiologie — au lieu d'un effet de
moniteur.

---

## 5. La voix — la moitié du problème est dans les mots

Règle unique : **chaque phrase doit contenir un fait que seul cet hôpital
pourrait écrire.**

| Actuel | Direction |
|---|---|
| « Trouvez ici toutes les informations pour vous préparer sereinement. » | « Cherchez le nom que votre cardiologue vous a donné. Chaque fiche dit ce qui se passe, ce qu'il faut apporter et quand vous rentrez chez vous. » |
| « Des spécialistes en cardiologie interventionnelle à votre écoute. » | « Trois cardiologues interventionnels. C'est l'un d'eux qui réalisera votre geste. » |
| « L'appréhension vient souvent de l'inconnu. » | À supprimer. La photo réelle de la salle dit déjà cela, sans le dire. |
| « Une équipe médicale et paramédicale à vos côtés. » | À faire écrire par le médecin, avec un fait : qui appelle le patient la veille, à quelle heure, pour dire quoi. |
| Aucune date, aucun auteur. | « Mise à jour le 4 juin 2026 · Relue par le Dr Mustapha Hassan · D'après la fiche GACI. » |

### Typographie française

Signal faible mais très discriminant : aucun gabarit généré ne le fait, et tout
professionnel français le remarque.

- Espace insécable avant `: ; ? !` et `%` — actuellement absent partout.
- Guillemets français `« »` au lieu des guillemets droits.
- Apostrophe typographique `’` — le code utilise `&apos;`, qui rend l'apostrophe
  droite.
- Numéros de téléphone groupés par deux : `04 78 22 91 12` (déjà correct).

---

## 6. Les détails d'artisanat

Le décor se copie, la preuve ne se copie pas. Six éléments à faible coût qui
portent l'essentiel du signal humain :

1. **Une date réelle par fiche.** `updatedAt` existe déjà et n'est jamais
   affiché. Signal humain le moins cher du projet.
2. **Un relecteur nommé par fiche.** Champ `reviewedBy` lié à la table `doctors`,
   affiché en bas de fiche. Engage une personne réelle.
3. **La source citée.** Les PDF GACI sont déjà dans `public/` et ingérés pour le
   RAG : les citer nommément au bas des fiches concernées.
4. **Des photos réelles, plus grandes.** Trois portraits + `cath-lab.jpeg` sont
   déjà là, aujourd'hui enfermés dans des vignettes arrondies. Pleine largeur,
   sans arrondi.
5. **Une asymétrie assumée.** La liste des fiches n'a pas à être une grille 3×N
   régulière. Une liste à filets, la fiche la plus consultée en premier et plus
   large, se lit mieux et ne ressemble à aucun gabarit.
6. **La version papier soignée.** La feuille d'impression existe : la finir
   (en-tête avec nom de l'hôpital et date, URL en pied, coupures maîtrisées). Une
   fiche qui s'imprime bien est le signal hospitalier le plus fort du site.

---

## 7. Plan d'exécution — 5 lots

Chaque lot est livrable et testable seul. **L'ordre n'est pas négociable :** le
lot 1 conditionne tous les autres.

### Lot 1 — Fondations *(invisible, décisif)*
Réécrire le thème : 10 jetons de couleur, échelle de 7 tailles, rayon unique,
zéro ombre. Basculer les polices. Supprimer le CSS mort (`.mesh-bg`, `.glass`,
`.glass-hover`, `.orb`, `.text-gradient`, `.glow-btn`, `anim-float`,
`anim-pulse-dot`).
Fichiers : `src/app/globals.css`, `src/app/layout.tsx`.

### Lot 2 — Accueil *(effet le plus visible)*
Hero désencombré et redimensionné, pastilles supprimées, dégradé de titre
supprimé, `AnimateIn` retiré, tracé ECG désamorcé, trio de réassurance traité.
Purge des hexadécimaux en ligne au profit des jetons.
Fichiers : `src/app/(public)/page.tsx`, `InterventionCard.tsx`,
`InterventionSearch.tsx`, `AnimateIn.tsx` (suppression).

### Lot 3 — Fiche intervention *(le plus de travail)*
Passage carte → document : suppression de `SectionCard` et `sectionAccent`,
numérotation chronologique, `quickFacts` en tableau à filets, sous-sections en
volets sobres, sommaire latéral en bas de casse.
Fichiers : `src/app/(public)/interventions/[slug]/page.tsx`,
`InterventionSidebarNav.tsx`, `Accordion.tsx`.

### Lot 4 — Chrome *(court)*
Header et Footer sur les jetons, question du logo tranchée, entrée unique vers
l'assistant, panneau de chat aligné sur le nouveau système.
Fichiers : `Header.tsx`, `Footer.tsx`, `ChatWidget.tsx`.

### Lot 5 — Preuve et papier *(court, fort rendement)*
Date de mise à jour et relecteur nommé sur chaque fiche, sources GACI citées,
typographie française (insécables, guillemets, apostrophes), feuille
d'impression finie.
Fichiers : `[slug]/page.tsx`, `src/types/intervention.ts`,
`InterventionForm.tsx`, `globals.css` (`@media print`).

---

## 8. Décisions ouvertes

À trancher avant le lot 1 :

1. **Le serif.** Source Serif 4 en titres *et* en corps, ou en titres seuls ? Le
   premier choix est plus fort et plus risqué auprès du médecin.
2. **Le logo.** Obtenir la charte Ramsay Santé, ou passer au nom seul ?
3. **Le tracé ECG.** Le garder désamorcé, ou le retirer complètement ?
4. **La copie.** Les phrases à faits doivent venir du médecin — préparer une
   liste de questions précises à lui poser.

## 9. Hors périmètre

L'admin n'est pas traité : outil interne, vu par trois personnes, son apparence
n'engage pas la vente. Il héritera mécaniquement du lot 1.

Aucune modification fonctionnelle n'est proposée : pas de changement de modèle de
données hors le champ `reviewedBy` du lot 5, pas de changement d'API, pas de
régression sur les cibles 44px, le `focus-visible`, ni sur l'absence totale de
cookies.

---

## 10. Sources

- [The « Built with AI » Tell: 12 Signals That Drop Trust (2026)](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026) — utsubo
- [AI Design Slop: 16 Patterns That Out Your App as Vibe-Coded](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) — Developers Digest
- [AI Slop Web Design: Complete Guide to Spotting and Fixing Generic Websites (2026)](https://www.925studios.co/blog/ai-slop-web-design-guide) — 925 Studios
- [Why your vibe-coded designs look generic](https://medium.com/design-bootcamp/why-your-vibe-coded-designs-look-generic-the-fix-isnt-better-prompts-09e2fda26591) — Jola Gil, Bootcamp
- [Typography](https://service-manual.nhs.uk/design-system/styles/typography) et [Design principles](https://service-manual.nhs.uk/design-system/design-principles) — NHS digital service manual
- [Healthcare Website Design: Patient-Centric UX](https://www.easternstandard.com/blog/healthcare-website-agency/) — Eastern Standard
