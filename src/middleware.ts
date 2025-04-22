// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "./lib/auth";
import { jwtDecode } from "jwt-decode";

const publicRoutes = [
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
  "/features",
];

const roleBasedRoutes = {
  adminOnly: ["/admin", "/settings"],
  managerPlus: ["/reports", "/analytics"],
};

export default async function middleware(request: NextRequest) {
  const token = getToken(request);
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Special case: allow post-login redirects
  if (searchParams.get("authed") === "true") {
    return NextResponse.next();
  }

  // Check public routes
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle unauthenticated access to protected routes
  if (!isPublicRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle authenticated access to auth routes
  if (token && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("authed", "true");
    return NextResponse.redirect(dashboardUrl);
  }

  // Verify token and check roles for protected routes
  if (token && !isPublicRoute) {
    try {
      const decoded = jwtDecode<{ role: string }>(token);
      const userRole = decoded.role;

      // Admin-only routes
      if (
        roleBasedRoutes.adminOnly.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        ) &&
        userRole !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Manager+ routes
      if (
        roleBasedRoutes.managerPlus.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        ) &&
        !["ADMIN", "MANAGER"].includes(userRole)
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
