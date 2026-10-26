import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sys_access_token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await fetch(`${API_BASE}/system-admin/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      const response = NextResponse.json(data, { status: res.status });
      if (res.status === 401) {
        response.cookies.set("sys_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
      }
      return response;
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
