import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getAdminSiteContent, saveSiteContent } from "@/lib/site-content";
import { mergeSiteContent } from "@/lib/site-defaults";

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
    return NextResponse.json(await getAdminSiteContent());
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger le contenu de la page d'accueil." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  try {
    const merged = mergeSiteContent(body);
    const saved = await saveSiteContent(merged);
    revalidatePath("/");
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le contenu de la page d'accueil." },
      { status: 500 }
    );
  }
}
