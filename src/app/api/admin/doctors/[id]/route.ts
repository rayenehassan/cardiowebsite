import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getDoctorById,
  updateDoctorById,
  archiveDoctorById,
  restoreDoctor,
} from "@/lib/doctors";

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  try {
    const doctor = await getDoctorById(id);
    if (!doctor) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    return NextResponse.json(doctor);
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger ce cardiologue." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  try {
    const existing = await getDoctorById(id);
    if (!existing) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    const updated = await updateDoctorById(id, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      subtitle: typeof body.subtitle === "string" ? body.subtitle.trim() : undefined,
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      email: typeof body.email === "string" ? body.email.trim() : undefined,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl.trim() : undefined,
    });

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce cardiologue." },
      { status: 500 }
    );
  }
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  try {
    const restored = await restoreDoctor(id);
    if (!restored) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    revalidatePath("/");
    return NextResponse.json(restored);
  } catch {
    return NextResponse.json(
      { error: "Impossible de restaurer ce cardiologue." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  try {
    const archived = await archiveDoctorById(id);
    if (!archived) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'archiver ce cardiologue." },
      { status: 500 }
    );
  }
}
