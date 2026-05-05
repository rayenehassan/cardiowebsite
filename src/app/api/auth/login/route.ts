import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  createToken,
  ADMIN_API_COOKIE_NAME,
  ADMIN_PAGE_COOKIE_NAME,
  ADMIN_API_COOKIE_PATH,
  ADMIN_PAGE_COOKIE_PATH,
  LEGACY_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "L'identifiant et le mot de passe sont requis" },
      { status: 400 }
    );
  }

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  const token = await createToken(username);

  const response = NextResponse.json({ success: true });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 8, // 8 heures
  };
  response.cookies.set(ADMIN_PAGE_COOKIE_NAME, token, {
    ...cookieOptions,
    path: ADMIN_PAGE_COOKIE_PATH,
  });
  response.cookies.set(ADMIN_API_COOKIE_NAME, token, {
    ...cookieOptions,
    path: ADMIN_API_COOKIE_PATH,
  });
  response.cookies.set(LEGACY_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
