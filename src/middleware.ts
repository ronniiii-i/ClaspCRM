// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
// import { getToken } from "./lib/auth";

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
];

const roleBasedRoutes = {
  adminOnly: ["/admin"],
  managerPlus: ["/reports", "/analytics"],
};

export default async function middleware(request: NextRequest) {
  // Get token from HTTP-only cookie (accessible in middleware)
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Processing request for ${pathname}`);
  console.log(`Middleware: Token from cookie: ${token ? token.substring(0, 10) + '...' : 'None'}`);

  // Skip middleware for static files and API routes
  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle unauthenticated access to protected routes
  if (!isPublicRoute && !token) {
    console.log(`Middleware: No token and not public route, redirecting to /login from ${pathname}`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle authenticated access to auth routes
  if (
    token &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname === "/verify-email")
  ) {
    console.log(`Middleware: Token present on auth route (${pathname}), redirecting to /dashboard`);
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Verify token and check roles for protected routes
  if (token && !isPublicRoute) {
    try {
      const decoded = jwtDecode<{ role: string }>(token);
      const userRole = decoded.role;
      console.log(`Middleware: Token decoded, user role: ${userRole}`);

      // Admin-only routes
      if (
        roleBasedRoutes.adminOnly.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        ) &&
        userRole !== "ADMIN"
      ) {
        console.log(`Middleware: Access denied for ${pathname} (Admin only), redirecting to /dashboard`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Manager+ routes (HOD, ADMIN)
      if (
        roleBasedRoutes.managerPlus.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        ) &&
        !["ADMIN", "HOD"].includes(userRole)
      ) {
        console.log(`Middleware: Access denied for ${pathname} (Manager+ only), redirecting to /dashboard`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Middleware: Token verification failed:", error);
      // If token is invalid or expired, clear the cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token"); // Clear the invalid cookie
      const url = new URL(response.url);
      url.searchParams.set("error", "invalid_token");
      response.headers.set('Location', url.toString());
      return response;
    }
  }

  console.log(`Middleware: Access granted for ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};