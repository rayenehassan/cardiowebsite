import { cache } from "react";
import { Doctor } from "@/types/doctor";
import {
  readActiveDoctors,
  readActiveDoctorsAdmin,
  readArchivedDoctors,
  readDoctorById,
  insertDoctor,
  updateDoctor,
  archiveDoctor,
  nextDisplayOrder,
  setDoctorOrder,
} from "@/lib/doctors-store";

// --- Lectures publiques ---

export const getPublicDoctors = cache(
  async (): Promise<Doctor[]> => readActiveDoctors()
);

// --- Lectures admin ---

export async function getActiveDoctors(): Promise<Doctor[]> {
  return readActiveDoctorsAdmin();
}

export async function getArchivedDoctors(): Promise<Doctor[]> {
  return readArchivedDoctors();
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  return readDoctorById(id);
}

// --- Mutations ---

export async function createDoctor(
  data: Omit<Doctor, "id" | "createdAt" | "updatedAt" | "displayOrder" | "status"> & {
    displayOrder?: number;
    status?: Doctor["status"];
  }
): Promise<Doctor> {
  const displayOrder =
    data.displayOrder !== undefined ? data.displayOrder : await nextDisplayOrder();
  return insertDoctor({
    name: data.name,
    subtitle: data.subtitle,
    phone: data.phone,
    email: data.email,
    photoUrl: data.photoUrl,
    displayOrder,
    status: data.status ?? "active",
  });
}

export async function updateDoctorById(
  id: string,
  data: Partial<Omit<Doctor, "id" | "createdAt" | "updatedAt">>
): Promise<Doctor | undefined> {
  return updateDoctor(id, data);
}

export async function archiveDoctorById(id: string): Promise<boolean> {
  return archiveDoctor(id);
}

export async function restoreDoctor(id: string): Promise<Doctor | undefined> {
  const next = await nextDisplayOrder();
  return updateDoctor(id, { status: "active", displayOrder: next });
}

export async function reorderDoctors(ids: string[]): Promise<Doctor[]> {
  return setDoctorOrder(ids);
}
