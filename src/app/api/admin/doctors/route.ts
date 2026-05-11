import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getActiveDoctors, createDoctor } from "@/lib/doctors";

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
    return NextResponse.json(await getActiveDoctors());
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les cardiologues." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  let body: {
    name?: string;
    subtitle?: string;
    phone?: string;
    email?: string;
    photoUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json(
      { error: "Le nom du cardiologue est requis." },
      { status: 400 }
    );
  }

  try {
    const doctor = await createDoctor({
      name: body.name.trim(),
      subtitle: body.subtitle?.trim() || "Cardiologie interventionnelle",
      phone: body.phone?.trim() || "",
      email: body.email?.trim() || "",
      photoUrl: body.photoUrl?.trim() || "",
    });

    revalidatePath("/");
    return NextResponse.json(doctor, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le cardiologue." },
      { status: 500 }
    );
  }
}
