import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = new Set(["www", "api", "app", "admin", "system", "system-admin", "login"]);
const ROOT_ROUTES = new Set([
  "about",
  "contact",
  "create-workspace",
  "dashboard",
  "find-workspace",
  "forgot-password",
  "pricing",
  "privacy",
  "profile",
  "register",
  "reset-password",
  "settings",
  "terms",
  "user-management",
  "verify-email",
]);

function getRootDomain(): string {
  const configuredDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  return configuredDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
}

function getSlugFromHost(host: string): string | null {
  if (!host) return null;
  const rootDomain = getRootDomain();
  const hostname = host.toLowerCase().split(":")[0];
  const rootHostname = rootDomain.split(":")[0];

  if (hostname === "localhost" || hostname === rootHostname || hostname === `www.${rootHostname}`) {
    return null;
  }

  if (hostname.endsWith(`.${rootHostname}`)) {
    const parts = hostname.split(".");
    if (parts.length === rootHostname.split(".").length + 1) {
      const slug = parts[0];
      if (RESERVED.has(slug)) return null;
      if (/^[a-z0-9-]+$/.test(slug)) return slug;
    }
    return null;
  }

  return null;
}

function isValidSlug(slug: string): boolean {
  if (RESERVED.has(slug)) return false;
  return /^[a-z0-9-]+$/.test(slug);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const slug = getSlugFromHost(host);
  const { pathname } = request.nextUrl;

  // If on tenant subdomain
  if (slug && isValidSlug(slug)) {
    // Skip internal paths
    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/static") || pathname.startsWith("/_vercel")) {
      const res = NextResponse.next();
      res.headers.set("x-tenant-slug", slug);
      return res;
    }
    // Block non-tenant routes on tenant subdomains
    if (pathname.startsWith("/system-admin") || pathname.startsWith("/find-workspace") || pathname.startsWith("/create-workspace") || pathname.startsWith("/register")) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Tenant URLs are canonical on the subdomain, never as /{slug}/... paths.
    if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
      const strippedPath = pathname.slice(slug.length + 1) || "/";
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = strippedPath;
      return NextResponse.redirect(redirectUrl);
    }

    // The dynamic tenant route is internal; keep the tenant subdomain in the
    // browser URL while routing to /{tenant}/...
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === "/" ? `/${slug}` : `/${slug}${pathname}`;
    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set("x-tenant-slug", slug);
    return res;
  }

  // Apex domain
  const firstPathSegment = pathname.split("/")[1];
  if (firstPathSegment && !ROOT_ROUTES.has(firstPathSegment) && isValidSlug(firstPathSegment)) {
    const rootDomain = getRootDomain();
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = `${firstPathSegment}.${rootDomain}`;
    redirectUrl.pathname = pathname.slice(firstPathSegment.length + 1) || "/";
    return NextResponse.redirect(redirectUrl);
  }
  if (pathname.startsWith("/system-admin")) {
    const res = NextResponse.next();
    return res;
  }
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/find-workspace", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
