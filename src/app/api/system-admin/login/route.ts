import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/system-admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    const response = NextResponse.json(data);
    if (data.accessToken || data.token) {
      const token = data.accessToken || data.token;
      response.cookies.set("sys_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 30,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
