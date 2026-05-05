# CardioInfo

Plateforme Next.js 16 pour informer les patients avant un geste de cardiologie
interventionnelle. Les fiches d’intervention sont dynamiques et stockées dans
Supabase.

## Démarrage local

1. Copier `.env.example` vers `.env.local`.
2. Renseigner `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` et `JWT_SECRET`.
3. Exécuter `supabase/schema.sql` dans le SQL Editor Supabase.
4. Lancer le serveur :

```bash
npm run dev
```

Le site public lit uniquement les interventions `published`. L’espace admin lit
et écrit toutes les interventions via les routes `/api/admin/interventions`.
Les cookies d’authentification sont limités aux chemins admin et ne sont pas
envoyés sur les pages publiques.

## Production

Définir les mêmes variables d’environnement sur l’hébergeur. Supabase reste la
source de vérité : aucune donnée patient n’est collectée côté public et aucun
stockage fichier n’est utilisé pour les interventions.

## Vérifications

```bash
npm run lint
npm run build
```
