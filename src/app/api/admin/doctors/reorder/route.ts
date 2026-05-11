import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { reorderDoctors } from "@/lib/doctors";

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

export async function PUT(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (
    !Array.isArray(body.ids) ||
    !body.ids.every((v): v is string => typeof v === "string")
  ) {
    return NextResponse.json(
      { error: "Le champ 'ids' doit être un tableau de chaînes." },
      { status: 400 }
    );
  }

  try {
    const doctors = await reorderDoctors(body.ids);
    revalidatePath("/");
    return NextResponse.json(doctors);
  } catch {
    return NextResponse.json(
      { error: "Impossible de réordonner les cardiologues." },
      { status: 500 }
    );
  }
}
