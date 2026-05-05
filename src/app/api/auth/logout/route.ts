import { NextResponse } from "next/server";
import {
  ADMIN_API_COOKIE_NAME,
  ADMIN_PAGE_COOKIE_NAME,
  ADMIN_API_COOKIE_PATH,
  ADMIN_PAGE_COOKIE_PATH,
  LEGACY_COOKIE_NAME,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_PAGE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: ADMIN_PAGE_COOKIE_PATH,
  });
  response.cookies.set(ADMIN_API_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
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
