import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected path prefixes and the roles that can access them
const ROLE_PATHS: Record<string, string> = {
  "/admin": "admin",
  "/doctor": "doctor",
  "/receptionist": "receptionist",
  "/patient": "patient",
};

const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("hms-token")?.value;
  const role = request.cookies.get("hms-role")?.value;

  // ── Check if user is authenticated ─────────────────────────────────
  const isAuthenticated = !!token && !!role;

  // ── Public routes (login, register) ────────────────────────────────
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If already authenticated, redirect to their dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    // Allow unauthenticated users to access login/register
    return NextResponse.next();
  }

  // ── Root path ──────────────────────────────────────────────────────
  if (pathname === "/" || pathname === "") {
    if (isAuthenticated) {
      // User is authenticated → go to their dashboard
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    // User is NOT authenticated → go to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Protected role-based routes ────────────────────────────────────
  const matchedPrefix = Object.keys(ROLE_PATHS).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (matchedPrefix) {
    const requiredRole = ROLE_PATHS[matchedPrefix];

    // NOT authenticated → redirect to login with redirect param
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated but WRONG role → redirect to their own dashboard
    if (role !== requiredRole) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Correct role → allow access
    return NextResponse.next();
  }

  // ── All other paths (allow through) ────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
