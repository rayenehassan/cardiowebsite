# CardioInfo

Plateforme française d’information pré-interventionnelle en cardiologie.

## Stack
- Next.js 16 App Router + TypeScript + Tailwind v4.
- Auth admin par JWT avec `jose`.
- Données dynamiques dans Supabase Postgres, schéma dans `supabase/schema.sql`.
- Lire les docs locales Next dans `node_modules/next/dist/docs/` avant tout changement Next.

## Architecture
- Public patient : `src/app/(public)` ; aucune auth, aucun tracking, aucun cookie public.
- Admin médecin : `src/app/admin/(protected)` ; protégé par `src/proxy.ts` puis vérification JWT dans le layout serveur.
- API admin : `src/app/api/admin/interventions` ; toutes les mutations passent par ces routes.
- Data access : `src/lib/interventions.ts` appelle `src/lib/store.ts`.
- Supabase : `src/lib/supabase.ts` expose un client public anon/RLS et un client admin `service_role`.
- Fixtures : `src/data/interventions.ts` sert de référence seulement, jamais de fallback runtime.

## Supabase
- Variables requises : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`.
- Variable recommandée : `SUPABASE_ANON_KEY` pour les lectures publiques avec RLS.
- Public : lire uniquement `status = "published"` via `getPublishedInterventions()` et `getPublishedInterventionBySlug()`.
- Admin : lire tous les statuts via `getAllInterventions()` et `getInterventionById()`.
- Ne pas réintroduire de stockage JSON ou de fallback mock si Supabase échoue.
- Après mutation, revalider `/` et les pages intervention concernées.

## Confidentialité
- Aucune donnée patient, compte patient, session patient, analytics ou fingerprinting.
- Les cookies admin sont distincts et limités à `/admin` et `/api/admin`.
- Les documents `isPublic: false` ne doivent jamais apparaître côté patient.

## Modèle
`Intervention` contient notamment :
`id`, `slug`, `title`, `subtitle`, `status`, `overview`, `whyPerformed`,
`preparation`, `duringProcedure`, `afterProcedure`, `risks`, `practicalInfo`,
`videos`, `images`, `documents`, `faqs`, `createdAt`, `updatedAt`.

## Conventions
- UI et contenus visibles en français, vocabulaire adapté à la cardiologie interventionnelle.
- Tailwind v4 : couleurs et tokens dans `src/app/globals.css`, pas de `tailwind.config`.
- Routes publiques dynamiques pour refléter Supabase en production.
- Valider avec `npm run lint` et `npm run build` avant livraison.
