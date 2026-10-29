import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("sys_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  try {
    const token = req.cookies.get("sys_access_token")?.value;
    if (token) {
      await fetch(`${API_BASE}/system-admin/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {}
  return response;
}
