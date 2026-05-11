/**
 * Adaptateur Supabase pour la table `doctors`.
 * Soft delete via status = 'archived' (calque pattern interventions).
 */

import { supabaseAdmin, supabasePublic } from "@/lib/supabase";
import { Doctor, DoctorStatus } from "@/types/doctor";
import { StoreError } from "@/lib/store";

const FULL_SELECT =
  "id, display_order, name, subtitle, phone, email, photo_url, status, created_at, updated_at";

interface Row {
  id: string;
  display_order: number;
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function toModel(row: Row): Doctor {
  return {
    id: row.id,
    displayOrder: row.display_order,
    name: row.name,
    subtitle: row.subtitle,
    phone: row.phone,
    email: row.email,
    photoUrl: row.photo_url,
    status: row.status as DoctorStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapError(operation: string, error: { message: string }) {
  return new StoreError(`${operation}: ${error.message}`, error);
}

export async function readActiveDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabasePublic
    .from("doctors")
    .select(FULL_SELECT)
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) throw mapError("readActiveDoctors", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readActiveDoctorsAdmin(): Promise<Doctor[]> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .select(FULL_SELECT)
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) throw mapError("readActiveDoctorsAdmin", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readArchivedDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .select(FULL_SELECT)
    .eq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) throw mapError("readArchivedDoctors", error);
  return (data as unknown as Row[]).map(toModel);
}

export async function readDoctorById(id: string): Promise<Doctor | undefined> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .select(FULL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw mapError("readDoctorById", error);
  return data ? toModel(data as unknown as Row) : undefined;
}

export async function insertDoctor(
  doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">
): Promise<Doctor> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .insert({
      display_order: doctor.displayOrder,
      name: doctor.name,
      subtitle: doctor.subtitle,
      phone: doctor.phone,
      email: doctor.email,
      photo_url: doctor.photoUrl,
      status: doctor.status,
    })
    .select(FULL_SELECT)
    .single();

  if (error) throw mapError("insertDoctor", error);
  return toModel(data as unknown as Row);
}

export async function updateDoctor(
  id: string,
  patch: Partial<Omit<Doctor, "id" | "createdAt" | "updatedAt">>
): Promise<Doctor | undefined> {
  const rowPatch: Record<string, unknown> = {};
  if (patch.displayOrder !== undefined) rowPatch.display_order = patch.displayOrder;
  if (patch.name !== undefined) rowPatch.name = patch.name;
  if (patch.subtitle !== undefined) rowPatch.subtitle = patch.subtitle;
  if (patch.phone !== undefined) rowPatch.phone = patch.phone;
  if (patch.email !== undefined) rowPatch.email = patch.email;
  if (patch.photoUrl !== undefined) rowPatch.photo_url = patch.photoUrl;
  if (patch.status !== undefined) rowPatch.status = patch.status;

  const { data, error } = await supabaseAdmin
    .from("doctors")
    .update(rowPatch)
    .eq("id", id)
    .select(FULL_SELECT)
    .maybeSingle();

  if (error) throw mapError("updateDoctor", error);
  return data ? toModel(data as unknown as Row) : undefined;
}

export async function archiveDoctor(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw mapError("archiveDoctor", error);
  return Boolean(data);
}

export async function nextDisplayOrder(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("doctors")
    .select("display_order")
    .eq("status", "active")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw mapError("nextDisplayOrder", error);
  const max = (data as { display_order: number } | null)?.display_order ?? -1;
  return max + 1;
}

export async function setDoctorOrder(
  ids: string[]
): Promise<Doctor[]> {
  // Upsert un display_order pour chaque id dans l'ordre passé.
  // Pas de transaction Supabase JS : on émet en parallèle et on relit ensuite.
  const updates = ids.map((id, index) =>
    supabaseAdmin
      .from("doctors")
      .update({ display_order: index })
      .eq("id", id)
  );
  const results = await Promise.all(updates);
  for (const r of results) {
    if (r.error) throw mapError("setDoctorOrder", r.error);
  }
  return readActiveDoctorsAdmin();
}
