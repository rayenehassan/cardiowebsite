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
import {
  checkLoginRate,
  recordLoginFailure,
  clearLoginFailures,
  clientKeyFromHeaders,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateKey = clientKeyFromHeaders(request.headers);

  // Anti-bruteforce : verrouille après trop d'échecs récents depuis cette IP.
  const rate = checkLoginRate(rateKey);
  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterSec / 60);
    return NextResponse.json(
      {
        error: `Trop de tentatives de connexion. Réessayez dans ${minutes} minute${
          minutes > 1 ? "s" : ""
        }.`,
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "L'identifiant et le mot de passe sont requis" },
      { status: 400 }
    );
  }

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    recordLoginFailure(rateKey);
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
    );
  }

  clearLoginFailures(rateKey);
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
