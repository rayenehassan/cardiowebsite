import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getAllInterventions, createIntervention } from "@/lib/interventions";
import { StoreConflictError } from "@/lib/store";

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    return NextResponse.json(await getAllInterventions());
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les interventions depuis Supabase." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();

  try {
    const intervention = await createIntervention({
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || "",
      status: body.status || "draft",
      sections: body.sections || [],
      quickFacts: body.quickFacts || [],
    });

    revalidatePath("/");
    revalidatePath(`/interventions/${intervention.slug}`);

    return NextResponse.json(intervention, { status: 201 });
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
