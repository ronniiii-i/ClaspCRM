import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/about",
  "/contact",
  "/pricing",
  "/faq",
  "/blog",
  "/features",
  "/demo",
  "/docs",
  "/support",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const ROLE_GATED_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/reports": ["ADMIN", "HOD"],
  "/analytics": ["ADMIN", "HOD"],
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Unauthenticated access to a protected route
  if (!isPublicRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access auth pages
  if (
    token &&
    AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-gated routes
  if (token && !isPublicRoute) {
    try {
      const decoded = jwtDecode<{ role: string }>(token);
      const userRole = decoded.role;

      for (const [routePrefix, allowedRoles] of Object.entries(
        ROLE_GATED_ROUTES,
      )) {
        if (
          (pathname === routePrefix ||
            pathname.startsWith(`${routePrefix}/`)) &&
          !allowedRoles.includes(userRole)
        ) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    } catch {
      // Token is malformed or expired — clear it and redirect to login
      const response = NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url),
      );
      response.cookies.delete("access_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
