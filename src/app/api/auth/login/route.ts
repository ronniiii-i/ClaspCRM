import { NextResponse } from "next/server";
import { serialize } from "cookie";

const BACKEND_LOGIN_URL = `${process.env.NEXT_PUBLIC_API}/auth/login`;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const backendResponse = await fetch(BACKEND_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    const { accessToken } = backendData;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Authentication failed: no token received." },
        { status: 500 },
      );
    }

    // maxAge in seconds (1 hour) — matches JWT expiry
    const cookie = serialize("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: backendData.message || "Login successful",
        user: backendData.user,
        accessToken,
      },
      { status: 200 },
    );

    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal server error during authentication." },
      { status: 500 },
    );
  }
}
