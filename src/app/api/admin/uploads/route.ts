import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSignedUploadUrl, deleteFile, extractPathFromUrl } from "@/lib/storage";

async function requireAuth() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

/** Demande une URL signée pour upload direct navigateur → Supabase */
export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { kind, filename, size, mime } = body;

    if (!kind || !filename || !size || !mime)
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    const result = await createSignedUploadUrl({ kind, filename, size, mime });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de la signature" },
      { status: 400 }
    );
  }
}

/** Supprime un fichier du bucket par URL publique ou chemin */
export async function DELETE(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    const body = await request.json();
    const path: string | null = body.path ?? (body.url ? extractPathFromUrl(body.url) : null);

    if (!path)
      return NextResponse.json({ error: "Chemin ou URL manquant" }, { status: 400 });

    await deleteFile(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de la suppression" },
      { status: 500 }
    );
  }
}
