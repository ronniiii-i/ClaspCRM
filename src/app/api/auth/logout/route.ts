import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("sys_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
