import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// ── Secrets serveur ─────────────────────────────────────────────────────────
// JWT_SECRET et ADMIN_PASSWORD_HASH doivent impérativement être fournis en
// variables d'environnement. Les fallbacks ont été supprimés : un secret par
// défaut connu publiquement permettrait à n'importe qui de forger un JWT.

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error(
    "JWT_SECRET manquant. Définissez la variable d'environnement avant de démarrer l'application."
  );
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  throw new Error(
    "ADMIN_USERNAME et ADMIN_PASSWORD_HASH (bcrypt) doivent être définis."
  );
}

const ADMIN_PAGE_COOKIE_NAME = "cardioinfo-admin-page-token";
const ADMIN_API_COOKIE_NAME = "cardioinfo-admin-api-token";
const LEGACY_COOKIE_NAME = "cardioinfo-admin-token";
const ADMIN_PAGE_COOKIE_PATH = "/admin";
const ADMIN_API_COOKIE_PATH = "/api/admin";

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH!);
  } catch {
    return false;
  }
}

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username, rôle: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ username: string; rôle: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string; rôle: string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{
  username: string;
  rôle: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_API_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminPageSession(): Promise<{
  username: string;
  rôle: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_PAGE_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export {
  ADMIN_PAGE_COOKIE_NAME,
  ADMIN_API_COOKIE_NAME,
  LEGACY_COOKIE_NAME,
  ADMIN_PAGE_COOKIE_PATH,
  ADMIN_API_COOKIE_PATH,
};
