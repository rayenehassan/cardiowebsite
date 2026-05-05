import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PAGE_COOKIE_NAME,
} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protège seulement les routes admin (sauf login et API d'auth)
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/auth")
  ) {
    const hasAdminCookie = Boolean(
      request.cookies.get(ADMIN_PAGE_COOKIE_NAME)?.value
    );

    if (!hasAdminCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
