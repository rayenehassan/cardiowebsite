import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getChatLogs, countChatLogs } from "@/lib/chat-store";

async function requireAuth() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  try {
    const [logs, counts] = await Promise.all([getChatLogs(limit, offset), countChatLogs()]);
    return NextResponse.json({ logs, counts });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les logs." }, { status: 500 });
  }
}
