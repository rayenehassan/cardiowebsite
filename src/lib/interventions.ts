import { Intervention } from "@/types/intervention";
import {
  readAll,
  readArchived,
  readPublished,
  readById,
  readPublishedBySlug,
  insertOne,
  updateOne,
  removeOne,
} from "@/lib/store";

// --- Requêtes publiques (publiées uniquement) ---

export async function getPublishedInterventions(): Promise<Intervention[]> {
  return readPublished();
}

export async function getPublishedInterventionBySlug(
  slug: string
): Promise<Intervention | undefined> {
  return readPublishedBySlug(slug);
}

// --- Requêtes admin (tous statuts) ---

export async function getAllInterventions(): Promise<Intervention[]> {
  return readAll();
}

export async function getInterventionById(
  id: string
): Promise<Intervention | undefined> {
  return readById(id);
}

export async function createIntervention(
  data: Omit<Intervention, "id" | "createdAt" | "updatedAt">
): Promise<Intervention> {
  const now = new Date().toISOString();
  return insertOne({
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateIntervention(
  id: string,
  data: Partial<Omit<Intervention, "id" | "createdAt">>
): Promise<Intervention | undefined> {
  return updateOne(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function getArchivedInterventions(): Promise<Intervention[]> {
  return readArchived();
}

export async function restoreIntervention(
  id: string
): Promise<Intervention | undefined> {
  return updateOne(id, { status: "draft", updatedAt: new Date().toISOString() });
}

export async function deleteIntervention(id: string): Promise<boolean> {
  return removeOne(id);
}
