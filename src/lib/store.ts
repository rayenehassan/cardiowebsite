/**
 * Adaptateur de persistance Supabase (Postgres).
 * Toutes les opérations sont asynchrones et exécutées côté serveur.
 */

import { supabaseAdmin, supabasePublic } from "@/lib/supabase";
import { Intervention, InterventionStatus, Section } from "@/types/intervention";

// Includes legacy columns so toModel can migrate old rows on the fly.
interface Row {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: string;
  sections: unknown;
  // legacy columns (present until explicitly dropped in Supabase)
  overview?: string;
  why_performed?: string;
  preparation?: unknown;
  during_procedure?: string;
  after_procedure?: string;
  risks?: unknown;
  practical_info?: string;
  videos?: unknown;
  images?: unknown;
  documents?: unknown;
  faqs?: unknown;
  created_at: string;
  updated_at: string;
}

const FULL_SELECT =
  "id, slug, title, subtitle, status, sections, " +
  "overview, why_performed, preparation, during_procedure, after_procedure, " +
  "risks, practical_info, videos, images, documents, faqs, " +
  "created_at, updated_at";

export class StoreError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "StoreError";
  }
}

export class StoreConflictError extends StoreError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "StoreConflictError";
  }
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function uid(): string {
  return `m-${Math.random().toString(36).slice(2, 10)}`;
}

/** Converts legacy row columns into a Section[] when sections is empty. */
function legacyToSections(row: Row): Section[] {
  const sections: Section[] = [];

  if (row.overview?.trim()) {
    sections.push({ id: uid(), type: "text", title: "Vue d'ensemble", body: row.overview });
  }
  if (row.why_performed?.trim()) {
    sections.push({ id: uid(), type: "text", title: "Pourquoi cette procédure ?", body: row.why_performed });
  }

  const prep = asArray<string>(row.preparation).filter((s) => s.trim());
  if (prep.length) {
    sections.push({ id: uid(), type: "list", title: "Comment se préparer", ordered: true, items: prep });
  }

  if (row.during_procedure?.trim()) {
    sections.push({ id: uid(), type: "text", title: "Pendant l'intervention", body: row.during_procedure });
  }
  if (row.after_procedure?.trim()) {
    sections.push({ id: uid(), type: "text", title: "Après l'intervention", body: row.after_procedure });
  }

  const risks = asArray<string>(row.risks).filter((s) => s.trim());
  if (risks.length) {
    sections.push({ id: uid(), type: "list", title: "Risques", ordered: false, items: risks });
  }

  if (row.practical_info?.trim()) {
    sections.push({ id: uid(), type: "text", title: "Informations pratiques", body: row.practical_info });
  }

  type LegacyVideo = { id: string; title: string; url: string; type: string };
  for (const v of asArray<LegacyVideo>(row.videos)) {
    if (v.url?.trim()) {
      sections.push({
        id: uid(),
        type: "video",
        title: v.title || "Vidéo",
        videoUrl: v.url,
        videoType: (v.type as Section["videoType"]) ?? "youtube",
      });
    }
  }

  type LegacyImage = { id: string; title: string; url: string; alt: string };
  for (const img of asArray<LegacyImage>(row.images)) {
    if (img.url?.trim()) {
      sections.push({
        id: uid(),
        type: "image",
        title: img.title || "Image",
        imageUrl: img.url,
        imageAlt: img.alt || "",
      });
    }
  }

  type LegacyFaq = { id: string; question: string; answer: string };
  const faqs = asArray<LegacyFaq>(row.faqs).filter((f) => f.question?.trim());
  if (faqs.length) {
    sections.push({ id: uid(), type: "faqs", title: "Questions fréquentes", faqs });
  }

  return sections;
}

function toModel(row: Row): Intervention {
  const stored = asArray<Section>(row.sections);
  const sections = stored.length > 0 ? stored : legacyToSections(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status as InterventionStatus,
    sections,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(i: Intervention) {
  return {
    id: i.id,
    slug: i.slug,
    title: i.title,
    subtitle: i.subtitle,
    status: i.status,
    sections: i.sections,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

function mapError(operation: string, error: { message: string; code?: string }) {
  if (error.code === "23505") {
    return new StoreConflictError(
      "Une intervention utilise déjà ce slug. Choisissez une URL unique.",
      error
    );
  }
  return new StoreError(`${operation}: ${error.message}`, error);
}

export async function readAll(): Promise<Intervention[]> {
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .select(FULL_SELECT)
    .order("created_at", { ascending: true });

  if (error) throw mapError("readAll", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readPublished(): Promise<Intervention[]> {
  const { data, error } = await supabasePublic
    .from("interventions")
    .select(FULL_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) throw mapError("readPublished", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readById(id: string): Promise<Intervention | undefined> {
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .select(FULL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapError("readById", error);
  return data ? toModel(data as unknown as Row) : undefined;
}

export async function readPublishedBySlug(
  slug: string
): Promise<Intervention | undefined> {
  const { data, error } = await supabasePublic
    .from("interventions")
    .select(FULL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw mapError("readPublishedBySlug", error);
  return data ? toModel(data as unknown as Row) : undefined;
}

export async function insertOne(intervention: Intervention): Promise<Intervention> {
  const row = toRow(intervention);
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .insert(row)
    .select(FULL_SELECT)
    .single();

  if (error) throw mapError("insertOne", error);
  return toModel(data as unknown as Row);
}

export async function updateOne(
  id: string,
  patch: Partial<Omit<Intervention, "id" | "createdAt">>
): Promise<Intervention | undefined> {
  const rowPatch: Record<string, unknown> = {};
  if (patch.slug !== undefined) rowPatch.slug = patch.slug;
  if (patch.title !== undefined) rowPatch.title = patch.title;
  if (patch.subtitle !== undefined) rowPatch.subtitle = patch.subtitle;
  if (patch.status !== undefined) rowPatch.status = patch.status;
  if (patch.sections !== undefined) rowPatch.sections = patch.sections;
  if (patch.updatedAt !== undefined) rowPatch.updated_at = patch.updatedAt;

  const { data, error } = await supabaseAdmin
    .from("interventions")
    .update(rowPatch)
    .eq("id", id)
    .select(FULL_SELECT)
    .maybeSingle();

  if (error) throw mapError("updateOne", error);
  return data ? toModel(data as unknown as Row) : undefined;
}

export async function removeOne(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw mapError("removeOne", error);
  return Boolean(data);
}
