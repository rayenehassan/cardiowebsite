# Corrections d'audit — lot #6, #7, #8, #9, #11

Branche : `fix/audit-6-7-8-9-11`. Suite de `docs/audit-corrections.md`.

## Ce qui a été corrigé

### #6 — Avertissement au changement de slug (URL)
**Risque :** changer le slug d'une fiche déjà partagée (SMS, QR code) cassait
silencieusement tous les liens transmis aux patients.
**Correctif :** `InterventionForm.tsx` — en mode édition, si le slug diffère de
l'original, un encart d'avertissement orange s'affiche en rappelant l'ancienne
URL qui cessera de fonctionner. Aucune restriction technique (le médecin reste
libre), juste un garde-fou visuel.

### #7 — Anti-bruteforce sur le login admin
**Risque :** compte admin unique, aucune limite de tentatives.
**Correctif :** nouveau `src/lib/rate-limit.ts` (fenêtre glissante en mémoire,
5 échecs / 15 min par IP). `api/auth/login` renvoie `429` + `Retry-After` quand
la limite est atteinte ; une connexion réussie réinitialise le compteur (pas de
verrouillage après une simple faute de frappe). Le JSON malformé est aussi géré
(`400` au lieu d'un crash).
**Portée :** mémoire propre à l'instance serveur — adapté à un site mono-cabinet.
À l'échelle multi-instances, déplacer le compteur vers un store partagé (interface
inchangée). Documenté dans le fichier.

### #8 — Scroll-spy : dernière section atteignable
**Bug :** la dernière section, souvent courte, ne franchissait jamais le milieu de
l'écran → son entrée de menu ne devenait jamais active.
**Correctif :** `InterventionSidebarNav.tsx` — détection du bas de page
(`scrollY + innerHeight >= scrollHeight`) qui force le dernier item actif.

### #9 — Glossaire : pluriels + compatibilité vieux Safari
**Bug 1 :** « stents », « pacemakers » n'étaient pas reconnus (définition non
montrée). **Bug 2 (plus grave) :** le motif utilisait un lookbehind `(?<!…)` qui
**fait planter le module au chargement sur iOS Safari < 16.4** — la section
FAQ/les fiches pouvaient ne pas s'afficher sur d'anciens iPhone (public 60+).
**Correctif :** `glossary.ts` — lookbehind remplacé par une frontière capturée
(group 1) ; suffixe pluriel optionnel `(s|x)?` ajouté. Vérifié : aucun caractère
perdu, pas de faux positif, déduplication conservée.

### #11 — Réordre des médecins : retour immédiat (optimiste)
**Bug :** la ligne ne bougeait qu'après l'aller-retour serveur → sur connexion
lente, le clic semblait sans effet.
**Correctif :** `DoctorList.tsx` — ordre géré en état local, déplacement appliqué
immédiatement, rétabli en cas d'échec (avec message). Resynchronisation sur les
props serveur par ajustement d'état pendant le rendu (motif React recommandé,
sans `useEffect` — conforme `react-hooks/set-state-in-effect`).

## Vérification

| Dimension | État |
|---|---|
| `npm run lint` | ✅ propre |
| `npm run build` | ✅ exit 0 |
| Logique glossaire #9 (Node) | ✅ 10/10 (pluriels, sans lookbehind, intégrité du texte) |
| Logique limiteur #7 (Node) | ✅ 5/5 (clear-on-success, isolation par IP, Retry-After borné) |
| **Tests navigateur/HTTP réels (Playwright + Chromium)** | ✅ 15/15 |

### Détail des tests navigateur/HTTP réels
- **#7** : 6 POST réels sur `/api/auth/login` → 5×401 puis **429**.
- **#6** : l'avertissement apparaît quand on modifie `#slug`, disparaît si on
  remet la valeur d'origine.
- **#8** : en haut, 1re section active et dernière inactive ; après scroll en bas,
  la dernière section (courte) devient active.
- **#9** : rendu réel de `GlossaryText` → « stents » et « pacemaker » surlignés.
- **#11** : déplacement visible **avant** la réponse serveur (réseau ralenti à
  1,5 s via mock) ; sur réponse 500, l'ordre est rétabli et l'erreur affichée.

Harnais de test temporaires (`src/app/audit-harness/**`) supprimés après
vérification ; arbre propre, build OK.

## Limite résiduelle connue (#7)
Le compteur anti-bruteforce est en mémoire : un redémarrage du serveur le remet à
zéro, et il n'est pas partagé entre plusieurs instances. Suffisant pour ce
déploiement ; à migrer vers un store partagé si l'hébergement passe en multi-
instances.
