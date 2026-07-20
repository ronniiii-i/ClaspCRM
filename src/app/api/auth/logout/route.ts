import { NextResponse } from "next/server";
import { serialize } from "cookie";

const BACKEND_LOGOUT_URL = `${process.env.NEXT_PUBLIC_API}/auth/logout`;

export async function POST(request: Request) {
  const expiredCookie = serialize("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 },
  );
  response.headers.set("Set-Cookie", expiredCookie);

  // Notify backend to blacklist the token (best-effort)
  try {
    const incomingCookies = request.headers.get("Cookie");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (incomingCookies) headers["Cookie"] = incomingCookies;

    await fetch(BACKEND_LOGOUT_URL, {
      method: "POST",
      headers,
      credentials: "include",
    });
  } catch {
    // Non-fatal — cookie is already cleared
  }

  return response;
}
