// One-shot migration: converts legacy column data → sections JSONB for all rows where sections = []
const fs = require("fs");

const raw = fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "");
const env = Object.fromEntries(
  raw.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const { createClient } = require("../node_modules/@supabase/supabase-js");
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function uid() {
  return `m-${Math.random().toString(36).slice(2, 10)}`;
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function legacyToSections(row) {
  const sections = [];

  if (row.overview?.trim())
    sections.push({ id: uid(), type: "text", title: "Vue d'ensemble", body: row.overview });

  if (row.why_performed?.trim())
    sections.push({ id: uid(), type: "text", title: "Pourquoi cette procédure ?", body: row.why_performed });

  const prep = asArray(row.preparation).filter((s) => s.trim());
  if (prep.length)
    sections.push({ id: uid(), type: "list", title: "Comment se préparer", ordered: true, items: prep });

  if (row.during_procedure?.trim())
    sections.push({ id: uid(), type: "text", title: "Pendant l'intervention", body: row.during_procedure });

  if (row.after_procedure?.trim())
    sections.push({ id: uid(), type: "text", title: "Après l'intervention", body: row.after_procedure });

  const risks = asArray(row.risks).filter((s) => s.trim());
  if (risks.length)
    sections.push({ id: uid(), type: "list", title: "Risques", ordered: false, items: risks });

  if (row.practical_info?.trim())
    sections.push({ id: uid(), type: "text", title: "Informations pratiques", body: row.practical_info });

  for (const v of asArray(row.videos)) {
    if (v.url?.trim())
      sections.push({ id: uid(), type: "video", title: v.title || "Vidéo", videoUrl: v.url, videoType: v.type ?? "youtube" });
  }

  for (const img of asArray(row.images)) {
    if (img.url?.trim())
      sections.push({ id: uid(), type: "image", title: img.title || "Image", imageUrl: img.url, imageAlt: img.alt || "" });
  }

  const faqs = asArray(row.faqs).filter((f) => f.question?.trim());
  if (faqs.length)
    sections.push({ id: uid(), type: "faqs", title: "Questions fréquentes", faqs });

  return sections;
}

async function run() {
  const { data, error } = await client
    .from("interventions")
    .select("id, slug, overview, why_performed, preparation, during_procedure, after_procedure, risks, practical_info, videos, images, faqs, sections");

  if (error) { console.error(error); process.exit(1); }

  const toMigrate = data.filter((r) => !r.sections || r.sections.length === 0);
  console.log(`Found ${toMigrate.length} rows to migrate.`);

  for (const row of toMigrate) {
    const sections = legacyToSections(row);
    const { error: updateError } = await client
      .from("interventions")
      .update({ sections })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Failed ${row.slug}:`, updateError);
    } else {
      console.log(`✓ ${row.slug} — ${sections.length} sections written`);
    }
  }

  console.log("Done.");
}

run();
