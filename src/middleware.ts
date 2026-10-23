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

/**
 * Routes that require a session. Anything not listed here (and not public) is
 * assumed to be an unknown URL: it is allowed through so Next can render the
 * 404 boundary, which keeps the dashboard shell for signed-in users and shows
 * the standalone page otherwise.
 *
 * Add every new authenticated section here.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/user-management",
  "/admin",
  "/users",
  "/reports",
  "/analytics",
];

const ROLE_GATED_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/user-management": ["ADMIN"],
  "/users": ["ADMIN"],
  "/reports": ["ADMIN", "HOD"],
  "/analytics": ["ADMIN", "HOD"],
};

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  // Authenticated user trying to access auth pages
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unknown / public routes need no session handling.
  if (!isProtectedRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Unauthenticated access to a protected route
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwtDecode<{ role: string }>(token);
    const userRole = decoded.role;

    for (const [routePrefix, allowedRoles] of Object.entries(
      ROLE_GATED_ROUTES,
    )) {
      if (
        matchesRoute(pathname, routePrefix) &&
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
