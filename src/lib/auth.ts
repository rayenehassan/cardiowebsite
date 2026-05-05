import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cardioinfo-dev-secret-change-in-production"
);

const ADMIN_PAGE_COOKIE_NAME = "cardioinfo-admin-page-token";
const ADMIN_API_COOKIE_NAME = "cardioinfo-admin-api-token";
const LEGACY_COOKIE_NAME = "cardioinfo-admin-token";
const ADMIN_PAGE_COOKIE_PATH = "/admin";
const ADMIN_API_COOKIE_PATH = "/api/admin";

// Identifiants admin mock ; à remplacer par une recherche en BDD plus tard
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "cardio2025",
};

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
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
