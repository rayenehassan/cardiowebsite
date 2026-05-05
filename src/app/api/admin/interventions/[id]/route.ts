import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  getInterventionById,
  updateIntervention,
  deleteIntervention,
} from "@/lib/interventions";
import { StoreConflictError } from "@/lib/store";

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
    const intervention = await getInterventionById(id);
    if (!intervention) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    return NextResponse.json(intervention);
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger l’intervention depuis Supabase." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();

  try {
    const existing = await getInterventionById(id);
    if (!existing) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    const updated = await updateIntervention(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath(`/interventions/${existing.slug}`);
    revalidatePath(`/interventions/${updated.slug}`);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof StoreConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Impossible d’enregistrer l’intervention dans Supabase." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  try {
    const existing = await getInterventionById(id);
    const deleted = await deleteIntervention(id);

    if (!deleted) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    revalidatePath("/");
    if (existing) revalidatePath(`/interventions/${existing.slug}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer l’intervention dans Supabase." },
      { status: 500 }
    );
  }
}
