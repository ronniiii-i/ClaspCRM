import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = new Set(["www", "api", "app", "admin", "system", "system-admin"]);

function getSlugFromHost(host: string): string | null {
  if (!host) return null;
  const h = host.split(":")[0];
  if (h === "localhost" || h.endsWith(".claspcrm.com") === false && h.includes(".localhost") === false) {
    // apex/local apex
    if (h === "localhost" || h === "claspcrm.com" || h === "www.claspcrm.com") return null;
  }
  // *.localhost
  if (h.endsWith(".localhost")) {
    const parts = h.split(".");
    if (parts.length >= 3) {
      const slug = parts[0];
      if (RESERVED.has(slug)) return null;
      if (/^[a-z0-9-]+$/.test(slug)) return slug;
    }
    return null;
  }
  // *.claspcrm.com
  if (h.endsWith(".claspcrm.com")) {
    const parts = h.split(".");
    if (parts.length >= 3) {
      const slug = parts[0];
      if (RESERVED.has(slug)) return null;
      if (/^[a-z0-9-]+$/.test(slug)) return slug;
    }
    return null;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const slug = getSlugFromHost(host);
  const { pathname } = request.nextUrl;

  if (slug) {
    // Skip internal paths
    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/static")) {
      const res = NextResponse.next();
      res.headers.set("x-tenant-slug", slug);
      return res;
    }
    if (pathname.startsWith("/system-admin")) {
      return new NextResponse("Not Found", { status: 404 });
    }
    // Rewrite to [tenant] tree
    const url = request.nextUrl.clone();
    if (pathname.startsWith(`/${slug}`)) {
      url.pathname = pathname.replace(`/${slug}`, "") || "/";
    }
    url.pathname = `/[tenant]${url.pathname}`.replace("/[tenant]/", "/[tenant]/").replace("/[tenant]$", "/[tenant]");
    // Better: rewrite to /[tenant]/... 
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${slug}${pathname === "/" ? "" : pathname}`.replace(`/${slug}`, `/[tenant]`) || "/[tenant]";
    if (rewriteUrl.pathname === "/[tenant]") rewriteUrl.pathname = "/[tenant]/";
    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set("x-tenant-slug", slug);
    return res;
  }

  // Apex
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
