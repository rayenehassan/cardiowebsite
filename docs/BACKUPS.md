# Sauvegardes et restauration

Le site dépend de deux sources de données externes : **Supabase** (base de
données + Storage médias) et **Vercel** (déploiement). Ce document décrit ce
qui est sauvegardé automatiquement, ce qui ne l'est pas, et comment récupérer
en cas de problème.

## Ce qui est sauvegardé automatiquement

### Supabase Postgres (tables `interventions`, `doctors`, `site_content`)

- **Backups journaliers automatiques** côté Supabase.
- **Point-In-Time Recovery (PITR)** : restauration à n'importe quel instant
  des 7 derniers jours sur le plan gratuit, jusqu'à 30 jours sur les plans
  payants.
- Aucune action requise pour activer.

### Supabase Storage (bucket `intervention-media`)

- Les fichiers (photos cardiologues, images de fiches, vidéos, PDFs) **ne
  sont pas inclus** dans les backups Postgres.
- Storage n'a pas de backup automatique sur le plan gratuit. Voir section
  "Backup manuel des médias" plus bas.

### Code source (GitHub + Vercel)

- Le code est dans GitHub : historique git = backup complet.
- Vercel garde l'historique des déploiements et permet le rollback en 1 click
  vers n'importe quelle version antérieure.

## Comment restaurer

### Cas 1 : une fiche a été effacée par accident (soft delete)

Le soft delete archive la fiche, elle est récupérable depuis l'admin :

1. Aller sur `/admin/interventions`.
2. Faire défiler jusqu'à la section "Archivées".
3. Cliquer sur "Restaurer" sur la fiche concernée → elle repasse en brouillon.

Pareil pour les médecins : `/admin/equipe` → section "Archivés" → "Restaurer".

### Cas 2 : une fiche a été modifiée par erreur (le contenu est cassé)

1. Ouvrir le dashboard Supabase → SQL Editor.
2. Exécuter une requête sur le PITR pour voir le contenu il y a X heures :

   ```sql
   SELECT title, sections, updated_at
   FROM interventions
   WHERE id = 'ID_DE_LA_FICHE';
   ```

3. Si le contenu courant n'est pas le bon, contacter le support Supabase
   ou utiliser le PITR depuis le dashboard pour restaurer.

Alternative : Supabase Studio → Database → Backups → Restore to point in time.

### Cas 3 : la base entière est corrompue

1. Dashboard Supabase → Database → Backups.
2. Choisir un point dans le temps avant l'incident.
3. Restaurer.

⚠️ Tous les changements depuis ce point seront perdus.

### Cas 4 : un déploiement Vercel casse le site

1. Dashboard Vercel → Deployments.
2. Trouver le dernier déploiement qui fonctionnait.
3. Cliquer "Promote to Production".

Le site revient à cet état en < 30 secondes.

## Backup manuel des médias (Storage)

Le bucket `intervention-media` peut être exporté manuellement si besoin :

### Export ponctuel via le dashboard Supabase

1. Dashboard Supabase → Storage → `intervention-media`.
2. Sélectionner les fichiers à télécharger.
3. Right click → Download.

### Export complet automatisé (recommandé tous les 3 mois)

```bash
# Avec la Supabase CLI
supabase storage download intervention-media \
  --recursive --output ./backups/intervention-media-$(date +%Y-%m-%d)
```

## Données qui ne sont PAS sauvegardées

- **Brouillons localStorage** des admins : stockés dans le navigateur de
  l'admin. Si le navigateur est nettoyé, les brouillons non sauvegardés sont
  perdus. Pas de récupération possible.
- **Sessions admin** (cookies JWT) : reconnexion nécessaire après expiration
  (8h) ou rotation du `JWT_SECRET`.

## Procédure recommandée

1. **Mensuel** : vérifier que les fiches actives sont toujours intactes en
   visitant le site public et en parcourant les fiches.
2. **Trimestriel** : exporter manuellement le bucket Storage (commande ci-dessus).
3. **Avant chaque rotation de mot de passe admin** : noter le hash bcrypt
   actuel et le nouveau, dans un coffre-fort de mots de passe.

## En cas de problème

- Supabase support : https://supabase.com/support (réponse < 24h sur free,
  prioritaire sur pro).
- Vercel support : https://vercel.com/support (idem).
- Statut services en temps réel :
  - https://status.supabase.com
  - https://www.vercel-status.com
