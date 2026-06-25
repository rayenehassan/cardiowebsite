# Corrections d'audit — lot #1 à #4

Branche : `fix/audit-critical-1-4`. Contexte : corrections issues de l'audit
technique avant livraison client.

## Ce qui a été corrigé

### #1 — CRITIQUE — Contenu de liste corrompu au réordre/suppression
**Symptôme :** dans l'éditeur de fiche, déplacer ou supprimer un élément de liste
laissait l'éditeur Tiptap afficher l'ancien contenu (éléments keyés par index +
Tiptap qui n'observe pas `content` après init). On pouvait publier un ordre /
contenu différent de ce qui était affiché.
**Cause :** `RichTextEditor` ne resynchronisait jamais `value`.
**Correctif :** `src/components/admin/RichTextEditor.tsx` — effet qui appelle
`editor.commands.setContent(value, { emitUpdate: false })` quand `value` change
depuis l'extérieur, sauf si l'éditeur a le focus (frappe en cours → curseur
préservé). Corrige aussi la restauration de brouillon. API conforme Tiptap 3
(vérifiée dans `node_modules/@tiptap/core`).

### #2 — MAJEUR — Recherche insensible aux accents
**Symptôme :** « echocardiographie », « defibrillateur », « coeur » ne
renvoyaient aucun résultat (public 60+ tapant sans accent).
**Correctif :** nouveau `src/lib/text.ts` → `normalizeForSearch()` (retrait des
diacritiques + ligatures œ/æ + minuscules). Utilisé dans
`src/components/ui/InterventionSearch.tsx`. Prouvé par test (voir ci-dessous).

### #3 — MAJEUR — `quickFacts` non éditables
**Symptôme :** les encadrés « Durée / Anesthésie / … » en haut des fiches étaient
affichés côté patient mais **aucun éditeur** ne permettait de les créer.
**Correctif :** éditeur « Informations clés » dans
`src/components/admin/InterventionForm.tsx` (ajout / édition / réordre /
suppression), câblé dans le snapshot, le brouillon, la restauration et le payload
d'enregistrement. La route POST/PUT acceptait déjà `quickFacts`.

### #4 — MAJEUR — Médias orphelins + suppression dangereuse
**Symptôme (et bug caché trouvé) :** `FileUpload` supprimait l'ancien fichier du
bucket **immédiatement** au remplacement/retrait. Si l'admin n'enregistrait pas
(ou annulait), la fiche publiée pointait alors vers un fichier supprimé → **image
cassée pour les patients**. Et un upload abandonné restait orphelin.
**Correctif :** suppression différée. `src/lib/uploads-client.ts` centralise la
logique ; `FileUpload` ne supprime plus rien lui-même et signale les uploads via
`onUploaded`. Les formulaires (`InterventionForm`, `DoctorForm`) suppriment les
fichiers **uniquement après un enregistrement réussi** et seulement s'ils ne sont
plus référencés. On ne supprime jamais à l'abandon (un brouillon restaurable peut
encore pointer vers ces fichiers).

## Vérification

| Dimension | État |
|---|---|
| `npm run lint` | ✅ propre |
| `npm run build` (compile + types) | ✅ exit 0 |
| Tests logique Node (`scratchpad/verify.mjs`) | ✅ 10/10 (recherche accents + diff orphelins) |
| Conformité API Tiptap 3 `setContent` | ✅ vérifiée dans node_modules |

### Reste à confirmer en navigateur (non automatisable ici)
L'environnement n'a pas d'outil de pilotage navigateur et l'admin exige un login.
À valider manuellement (≈ 3 min, voir checklist) :
1. **#1** : éditer une fiche → section Liste de 3 éléments A/B/C → « descendre »
   sur A → l'éditeur doit afficher B, A, C (et non plus rester figé). Supprimer
   l'élément du milieu → le bon élément disparaît. Enregistrer → la fiche publique
   correspond.
2. **#3** : ajouter des « Informations clés » → enregistrer → vérifier les
   encadrés en haut de la fiche publique (icône auto pour Durée/Anesthésie/
   Hospitalisation/Reprise).
3. **#4** : remplacer une image puis **annuler** → l'image d'origine doit rester
   visible sur le site (plus de suppression prématurée). Remplacer puis
   enregistrer → l'ancien fichier est nettoyé.

## Limite résiduelle connue
Un fichier uploadé puis **jamais** enregistré (abandon total, brouillon ignoré)
reste un orphelin dans le bucket. Choix assumé : ne jamais risquer de supprimer un
fichier encore utile. Nettoyage propre = balayage serveur périodique (bucket vs
URLs référencées) — à planifier séparément.
