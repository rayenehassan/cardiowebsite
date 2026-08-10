import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCustomAnswer } from "@/lib/chat-store";

async function requireAuth() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();

  const patch: { doctorAnswer?: string; status?: "answered" | "dismissed" } = {};
  if (typeof body.doctorAnswer === "string") patch.doctorAnswer = body.doctorAnswer.trim();
  if (body.status === "answered" || body.status === "dismissed") patch.status = body.status;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide." }, { status: 400 });
  }

  try {
    const updated = await updateCustomAnswer(id, patch);
    if (!updated) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Impossible de mettre à jour." }, { status: 500 });
  }
}
