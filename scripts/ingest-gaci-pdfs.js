#!/usr/bin/env node
// Ingestion des PDFs GACI dans Supabase pour le RAG du chatbot.
// Usage : node scripts/ingest-gaci-pdfs.js [--dir public]
//
// Prérequis :
//   - python3 + pdfminer.six installés (pip3 install pdfminer.six)
//   - OPENAI_API_KEY dans .env.local
//   - SQL supabase/add-rag-documents.sql exécuté dans Supabase Dashboard

const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createClient } = require("../node_modules/@supabase/supabase-js");

// ── Lecture .env.local ──────────────────────────────────────────────────────
const raw = fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "");
const env = Object.fromEntries(
  raw.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const OPENAI_KEY = env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("❌  OPENAI_API_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ── Détection de l'exécutable Python ─────────────────────────────────────────
// Sur Windows, `python3` ouvre souvent le stub Microsoft Store : on essaie
// `python` / `py` d'abord, `python3` sur Unix.
function detectPython() {
  const candidates = process.platform === "win32"
    ? ["python", "py", "python3"]
    : ["python3", "python"];
  for (const c of candidates) {
    try {
      execSync(`${c} -c "import pdfminer"`, { stdio: "ignore" });
      return c;
    } catch { /* essaie le suivant */ }
  }
  console.error("❌  Python + pdfminer.six introuvables (pip install pdfminer.six)");
  process.exit(1);
}
const PY = detectPython();

// ── Extraction texte via pdfminer (Python) ──────────────────────────────────
function extractText(pdfPath) {
  // Slashes normalisés (chemins Windows) + échappement des apostrophes.
  const escaped = pdfPath.replace(/\\/g, "/").replace(/'/g, "\\'");
  return execSync(
    `${PY} -c "from pdfminer.high_level import extract_text; print(extract_text('${escaped}'))"`,
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, env: { ...process.env, PYTHONIOENCODING: "utf-8" } }
  );
}

// ── Découpage en chunks (~400 mots, 60 mots de chevauchement) ───────────────
function chunkText(text, chunkWords = 225, overlapWords = 40) {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkWords).join(" ").trim();
    if (chunk.length > 80) chunks.push(chunk);
    i += chunkWords - overlapWords;
  }
  return chunks;
}

// ── Embedding OpenAI text-embedding-3-small ─────────────────────────────────
async function getEmbedding(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI embeddings: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const pdfDir = process.argv[3] ?? "./public";
  const pdfs = fs.readdirSync(pdfDir).filter((f) => f.endsWith(".pdf"));

  if (pdfs.length === 0) {
    console.error(`❌  Aucun PDF trouvé dans ${pdfDir}`);
    process.exit(1);
  }

  console.log(`\n📄  ${pdfs.length} PDFs détectés dans ${pdfDir}`);
  console.log("🗑️   Suppression des anciens chunks…");
  const { error: delErr } = await supabase.from("documents").delete().gte("id", 0);
  if (delErr) { console.error("Erreur suppression :", delErr.message); process.exit(1); }

  let totalChunks = 0;

  for (const pdf of pdfs) {
    const pdfPath = path.join(pdfDir, pdf);
    console.log(`\n📖  ${pdf}`);

    let text;
    try {
      text = extractText(pdfPath);
    } catch (e) {
      console.warn(`   ⚠️  Impossible d'extraire le texte : ${e.message}`);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`   ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await getEmbedding(chunks[i]);
        const { error } = await supabase.from("documents").insert({
          source: pdf,
          chunk_index: i,
          content: chunks[i],
          embedding,
        });
        if (error) throw new Error(error.message);
        process.stdout.write(".");
        totalChunks++;
      } catch (e) {
        console.warn(`\n   ⚠️  Chunk ${i} ignoré : ${e.message}`);
      }
    }
  }

  console.log(`\n\n✅  Ingestion terminée — ${totalChunks} chunks stockés dans Supabase.`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
