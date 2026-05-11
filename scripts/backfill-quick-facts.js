// Backfill quick_facts for the 6 current interventions.
// Run AFTER applying the ALTER TABLE migration.
// Defaults are reasonable medical estimates — cardiologists should refine via admin form.

const fs = require("fs");

const raw = fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "");
const env = Object.fromEntries(
  raw.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const { createClient } = require("../node_modules/@supabase/supabase-js");
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const DEFAULTS = {
  "coronarographie": [
    { label: "Durée", value: "30 – 60 min" },
    { label: "Anesthésie", value: "Locale" },
    { label: "Hospitalisation", value: "Ambulatoire ou 1 nuit" },
    { label: "Reprise activité", value: "J+1" },
  ],
  "pose-stent-coronaire": [
    { label: "Durée", value: "1 – 2 h" },
    { label: "Anesthésie", value: "Locale" },
    { label: "Hospitalisation", value: "1 – 2 nuits" },
    { label: "Reprise activité", value: "J+3" },
  ],
  "angioplastie-coronaire": [
    { label: "Durée", value: "1 – 2 h" },
    { label: "Anesthésie", value: "Locale" },
    { label: "Hospitalisation", value: "1 – 2 nuits" },
    { label: "Reprise activité", value: "J+3" },
  ],
  "tavi": [
    { label: "Durée", value: "1 – 2 h" },
    { label: "Anesthésie", value: "Locale ou générale" },
    { label: "Hospitalisation", value: "3 – 5 jours" },
    { label: "Reprise activité", value: "J+15" },
  ],
  "implantation-pacemaker": [
    { label: "Durée", value: "1 h environ" },
    { label: "Anesthésie", value: "Locale" },
    { label: "Hospitalisation", value: "1 – 2 nuits" },
    { label: "Reprise activité", value: "J+7" },
  ],
  "reparation-mitrale-percutanee": [
    { label: "Durée", value: "2 – 3 h" },
    { label: "Anesthésie", value: "Générale" },
    { label: "Hospitalisation", value: "3 – 5 jours" },
    { label: "Reprise activité", value: "J+15" },
  ],
};

async function run() {
  const { data, error } = await client
    .from("interventions")
    .select("id, slug, quick_facts");

  if (error) { console.error(error); process.exit(1); }

  for (const row of data) {
    const facts = DEFAULTS[row.slug];
    if (!facts) {
      console.log(`- ${row.slug}: no defaults defined, skipping`);
      continue;
    }

    if (Array.isArray(row.quick_facts) && row.quick_facts.length > 0) {
      console.log(`- ${row.slug}: already populated (${row.quick_facts.length} facts), skipping`);
      continue;
    }

    const { error: updateError } = await client
      .from("interventions")
      .update({ quick_facts: facts })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Failed ${row.slug}:`, updateError);
    } else {
      console.log(`✓ ${row.slug} — ${facts.length} facts written`);
    }
  }

  console.log("Done.");
}

run();
