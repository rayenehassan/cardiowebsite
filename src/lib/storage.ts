import { supabaseAdmin } from "./supabase";

const BUCKET = "intervention-media";
const SUPABASE_URL = process.env.SUPABASE_URL!;

export type UploadKind = "image" | "video" | "document" | "doctor";

const CONFIG: Record<
  UploadKind,
  { maxBytes: number; mimes: string[]; folder: string; label: string }
> = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    folder: "images",
    label: "10 Mo",
  },
  video: {
    maxBytes: 50 * 1024 * 1024,
    mimes: ["video/mp4", "video/webm"],
    folder: "videos",
    label: "50 Mo",
  },
  document: {
    maxBytes: 20 * 1024 * 1024,
    mimes: ["application/pdf"],
    folder: "documents",
    label: "20 Mo",
  },
  doctor: {
    maxBytes: 10 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp"],
    folder: "doctors",
    label: "10 Mo",
  },
};

function safeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
}

export async function createSignedUploadUrl(params: {
  kind: UploadKind;
  filename: string;
  size: number;
  mime: string;
}): Promise<{ path: string; uploadUrl: string; publicUrl: string }> {
  const cfg = CONFIG[params.kind];
  if (!cfg) throw new Error("Type de fichier non supporté");

  if (params.size > cfg.maxBytes)
    throw new Error(`Fichier trop volumineux (max ${cfg.label})`);

  if (!cfg.mimes.includes(params.mime))
    throw new Error(`Format non autorisé pour ce type de contenu`);

  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  const safe = safeFilename(params.filename) || "fichier";
  const path = `${cfg.folder}/${ts}-${rand}-${safe}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) throw error ?? new Error("Échec de la signature Supabase");

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return { path, uploadUrl: data.signedUrl, publicUrl };
}

export function extractPathFromUrl(url: string): string | null {
  const prefix = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(prefix);
  if (idx === -1) return null;
  return url.slice(idx + prefix.length);
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
