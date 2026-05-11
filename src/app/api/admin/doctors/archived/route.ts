import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getArchivedDoctors } from "@/lib/doctors";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getArchivedDoctors());
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les cardiologues archivés." },
      { status: 500 }
    );
  }
}
