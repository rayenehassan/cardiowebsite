@AGENTS.md

# CardioInfo

Plateforme française d'information pré-interventionnelle en cardiologie. Le site public aide les patients à comprendre une procédure de cardiologie interventionnelle avant leur rendez-vous. L'espace admin permet aux médecins de gérer les fiches d'intervention, l'équipe médicale et les textes de la page d'accueil.

## Commandes

- `npm run dev` : serveur local Next.js.
- `npm run lint` : ESLint.
- `npm run build` : build de production.
- Avant livraison d'un changement de code, lancer `npm run lint` puis `npm run build` si l'environnement le permet.

## Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS v4 avec tokens dans `src/app/globals.css`; pas de `tailwind.config`.
- Supabase Postgres pour interventions, cardiologues et contenu d'accueil ; Supabase Storage pour les médias.
- Auth admin par JWT avec `jose`.
- Editeur riche admin avec Tiptap 3.
- Icônes via `lucide-react`.

## Règles Next.js 16

- IMPORTANT : avant toute modification Next.js, lire la doc locale pertinente dans `node_modules/next/dist/docs/`.
- Cela inclut routing, layouts/pages, Server/Client Components, Route Handlers, cache/revalidation, images, fonts, metadata, config et proxy.
- Next.js 16 utilise `proxy.ts` au lieu de Middleware; ce projet protège l'admin via `src/proxy.ts`.

## Domaine Et Confidentialité

- Tout texte visible dans l'UI doit rester en français.
- Ton patient : clair, rassurant, simple, sans remplacer l'avis personnalisé du cardiologue.
- Ne jamais ajouter de compte patient, session patient, analytics, tracking, fingerprinting ou cookie public.
- Les cookies admin sont séparés : page admin sur `/admin`, API admin sur `/api/admin`.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY`, le client admin Supabase ou les routes admin côté client public.
- Les sections document avec `isPublic: false` ne doivent jamais apparaître sur les pages patient.

## Modèle De Données

- Sources de vérité : tables Supabase `interventions`, `doctors`, `site_content`. Schéma dans `supabase/schema.sql`.
- `Intervention` (`src/types/intervention.ts`) : `id`, `slug`, `title`, `subtitle`, `status`, `sections`, `quickFacts`, `createdAt`, `updatedAt`.
- `status` intervention : `draft`, `published` ou `archived`. `sections` types : `text`, `list`, `video`, `image`, `document`, `faqs`.
- `quickFacts` affiché publiquement mais non édité par le form actuel : préserver sauf changement explicite.
- `Doctor` (`src/types/doctor.ts`) : équipe médicale éditable, soft delete via `status` (`active`/`archived`), ordre via `display_order`. RLS public filtre `status = 'active'`.
- `SiteContent` (`src/types/site.ts`) : singleton JSONB (`id = 'singleton'`) pour textes éditables de la page d'accueil. Champs manquants comblés par `mergeSiteContent` depuis `src/lib/site-defaults.ts`.
- `src/data/interventions.ts` est une fixture de référence seulement. Ne pas réintroduire de fallback runtime mock, JSON ou fichier si Supabase échoue.

## Accès Aux Données

- Interventions : `src/lib/interventions.ts` → `src/lib/store.ts`. Public via `getPublishedInterventions()` et `getPublishedInterventionBySlug()`. Admin via `getAllInterventions()` (exclut `archived`) et `getArchivedInterventions()`.
- Cardiologues : `src/lib/doctors.ts` → `src/lib/doctors-store.ts`. Public via `getPublicDoctors()` (actifs). Admin via `getActiveDoctors()` et `getArchivedDoctors()`.
- Contenu d'accueil : `src/lib/site-content.ts` → `src/lib/site-store.ts`. `getPublicSiteContent()` est dédupliqué par `React.cache()` (consommé par le layout public et la page d'accueil).
- `src/lib/supabase.ts` expose `supabasePublic` et `supabaseAdmin`; `supabaseAdmin` est serveur uniquement.
- Si `SUPABASE_ANON_KEY` existe, les lectures publiques passent aussi par RLS Supabase; sinon elles gardent le filtre serveur explicite.

## Architecture

- Public patient : `src/app/(public)`. Le layout charge `site_content` et passe `brand` au Header / `brand + footer` au Footer.
- Accueil : recherche d'interventions, liste des fiches publiées, équipe médicale (lue depuis `doctors`), disclaimer.
- Page intervention : rendu dynamique des sections, navigation latérale, `quickFacts`, glossaire médical, documents publics seulement.
- Admin : `src/app/admin/(protected)` avec vérification JWT dans le layout serveur.
  - Interventions : `interventions/` + `interventions/[id]` + `interventions/new`. API : `src/app/api/admin/interventions[/...]`.
  - Équipe : `equipe/` + `equipe/[id]` + `equipe/nouveau`. API : `src/app/api/admin/doctors[/...]` (`reorder`, `archived` inclus).
  - Page d'accueil : `page-accueil/`. API : `src/app/api/admin/site-content`.
- Login/logout : `src/app/api/auth/login` et `src/app/api/auth/logout`.
- Uploads admin : `src/app/api/admin/uploads` signe les uploads directs vers Supabase Storage.
- Glossaire patient : `src/lib/glossary.ts`, `GlossaryText`, `MedicalTerm`.

## Admin Et Contenu

- `InterventionForm` gère la création/édition avec constructeur de sections, réordonnancement, modèle de base et Tiptap. `DoctorForm` édite un cardiologue. `SiteContentForm` édite le singleton.
- Les statuts admin sont `draft` et `published`; `archived` est utilisé pour la suppression douce (interventions et cardiologues).
- Archive/restauration : `DELETE /api/admin/interventions/[id]` ou `/doctors/[id]` archive ; `PATCH` restaure.
- Après mutation d'une intervention : revalider `/` et `/interventions/{slug}` concernées. Après mutation de `doctors` ou `site_content` : revalider `/`.
- Tous les formulaires admin utilisent `useFormDraft` (brouillon localStorage debounced 1s) et `useBeforeUnload` depuis `src/lib/use-form-draft.ts`. Brouillon purgé via `clear()` après save réussi ; bandeau `DraftBanner` proposé à la remontée.
- Les uploads utilisent le bucket Supabase Storage `intervention-media`. `UploadKind` : `image`, `video`, `document`, `doctor` (photo portrait dans folder `doctors/`).
- Limites upload : images et photos médecin 10 Mo (`jpeg/png/webp[/gif]`), vidéos 50 Mo (`mp4/webm`), documents 20 Mo (`pdf`).
- Pour le rich text rendu via `dangerouslySetInnerHTML`, n'accepter que du contenu admin authentifié; ne jamais afficher de HTML public non maîtrisé.

## Variables D'environnement

- Requises en production : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
- Recommandée : `SUPABASE_ANON_KEY` pour que les lectures publiques bénéficient des policies RLS.
- Le bucket Storage `intervention-media` doit exister et être compatible avec les URLs publiques utilisées par le rendu patient.
- Les identifiants admin actuels sont centralisés dans `src/lib/auth.ts`; toute évolution auth doit partir de ce module.

## Conventions De Développement

- Préférer les Server Components; ajouter `"use client"` seulement pour état, effets, événements navigateur ou éditeurs interactifs.
- Réutiliser les helpers existants avant d'ajouter une abstraction.
- Réutiliser les composants UI/admin existants et les tokens CSS de `src/app/globals.css`.
- Conserver les routes publiques en rendu dynamique quand la donnée Supabase doit être visible immédiatement.
- Garder les erreurs API en français et ne pas masquer les conflits de slug (`StoreConflictError`).
- Ne pas modifier `.env.local` ni journaliser de secrets.
