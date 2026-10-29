import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
    const response = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const token = data.accessToken || data.token;
    const res = NextResponse.json({ accessToken: token, user: data.user }, { status: 200 });
    if (token) {
      res.cookies.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
