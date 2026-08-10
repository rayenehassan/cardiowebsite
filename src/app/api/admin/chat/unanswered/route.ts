import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCustomAnswers } from "@/lib/chat-store";

async function requireAuth() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    const items = await getCustomAnswers(undefined, 200);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Impossible de charger les questions." }, { status: 500 });
  }
}
