@AGENTS.md

# CardioInfo

Plateforme française d'information pré-interventionnelle en cardiologie. Le site public aide les patients à comprendre une procédure de cardiologie interventionnelle avant leur rendez-vous. L'espace admin permet aux médecins de créer, publier, archiver et restaurer les fiches d'intervention.

## Commandes

- `npm run dev` : serveur local Next.js.
- `npm run lint` : ESLint.
- `npm run build` : build de production.
- Avant livraison d'un changement de code, lancer `npm run lint` puis `npm run build` si l'environnement le permet.

## Stack

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS v4 avec tokens dans `src/app/globals.css`; pas de `tailwind.config`.
- Supabase Postgres pour les interventions et Supabase Storage pour les médias.
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

- Source de vérité : table Supabase `interventions`, schéma dans `supabase/schema.sql`.
- Type canonique : `src/types/intervention.ts`.
- `Intervention` contient `id`, `slug`, `title`, `subtitle`, `status`, `sections`, `quickFacts`, `createdAt`, `updatedAt`.
- `status` vaut `draft`, `published` ou `archived`.
- `sections` remplace les anciens champs legacy. Types supportés : `text`, `list`, `video`, `image`, `document`, `faqs`.
- `quickFacts` est affiché sur les pages publiques; le formulaire admin actuel ne l'édite pas, donc le préserver sauf changement explicite.
- `src/data/interventions.ts` est une fixture de référence seulement. Ne pas réintroduire de fallback runtime mock, JSON ou fichier si Supabase échoue.

## Accès Aux Données

- Public : lire uniquement les interventions `published` via `getPublishedInterventions()` et `getPublishedInterventionBySlug()`.
- Admin actif : `getAllInterventions()` exclut les `archived`.
- Admin archives : `getArchivedInterventions()` lit les fiches archivées.
- Toutes les opérations passent par `src/lib/interventions.ts`, puis `src/lib/store.ts`.
- `src/lib/supabase.ts` expose `supabasePublic` et `supabaseAdmin`; `supabaseAdmin` est serveur uniquement.
- Si `SUPABASE_ANON_KEY` existe, les lectures publiques passent aussi par RLS Supabase; sinon elles gardent le filtre serveur `status = published`.

## Architecture

- Public patient : `src/app/(public)`.
- Accueil : recherche d'interventions, liste des fiches publiées, équipe médicale, disclaimer.
- Page intervention : rendu dynamique des sections, navigation latérale, `quickFacts`, glossaire médical, documents publics seulement.
- Admin : `src/app/admin/(protected)` avec vérification JWT dans le layout serveur.
- Login/logout : `src/app/api/auth/login` et `src/app/api/auth/logout`.
- API interventions : `src/app/api/admin/interventions` et `src/app/api/admin/interventions/[id]`.
- Uploads admin : `src/app/api/admin/uploads` signe les uploads directs vers Supabase Storage.
- Glossaire patient : `src/lib/glossary.ts`, `GlossaryText`, `MedicalTerm`.

## Admin Et Contenu

- `InterventionForm` gère la création/édition avec constructeur de sections, réordonnancement, modèle de base et Tiptap.
- Les statuts admin sont `draft` et `published`; `archived` est utilisé pour la suppression douce.
- `DELETE /api/admin/interventions/[id]` archive une fiche; `PATCH` la restaure en brouillon.
- Après mutation d'une intervention, revalider `/` et les pages `/interventions/{slug}` concernées.
- Les uploads utilisent le bucket Supabase Storage `intervention-media`.
- Limites upload : images 10 Mo (`jpeg/png/webp/gif`), vidéos 50 Mo (`mp4/webm`), documents 20 Mo (`pdf`).
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
