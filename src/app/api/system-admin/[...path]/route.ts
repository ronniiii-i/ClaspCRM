import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

async function handler(req: NextRequest, context: any) {
  const token = req.cookies.get("sys_access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const params = typeof context?.params?.then === "function" ? await context.params : context?.params;
  const path = Array.isArray(params?.path) ? params.path.join("/") : "";
  const url = new URL(req.url);
  const target = `${API_BASE}/system-admin/${path}${url.search}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": req.headers.get("content-type") || "application/json",
  };
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();
  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Proxy error" }, { status: 502 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
