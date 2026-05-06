/**
 * Adaptateur de persistance Supabase (Postgres).
 * Toutes les opérations sont asynchrones et exécutées côté serveur.
 */

import { supabaseAdmin, supabasePublic } from "@/lib/supabase";
import { Intervention, InterventionStatus, Section } from "@/types/intervention";

interface Row {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: string;
  sections: unknown;
  created_at: string;
  updated_at: string;
}

const FULL_SELECT =
  "id, slug, title, subtitle, status, sections, created_at, updated_at";

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


function toModel(row: Row): Intervention {
  const sections = asArray<Section>(row.sections);
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
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) throw mapError("readAll", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readArchived(): Promise<Intervention[]> {
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .select(FULL_SELECT)
    .eq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw mapError("readArchived", error);
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
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw mapError("removeOne", error);
  return Boolean(data);
}
