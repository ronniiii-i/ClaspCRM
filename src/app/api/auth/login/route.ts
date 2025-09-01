import { NextResponse } from "next/server";
import { serialize } from "cookie";

const NESTJS_BACKEND_LOGIN_URL = `${process.env.NEXT_PUBLIC_API}/auth/login`;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const backendResponse = await fetch(NESTJS_BACKEND_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    const { accessToken } = backendData;

    if (!accessToken) {
      console.error(
        "Login Proxy: Backend did not return an accessToken in the body."
      );
      return NextResponse.json(
        { message: "Authentication failed: No token received." },
        { status: 500 }
      );
    }

    const cookie = serialize("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600000,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: backendData.message || "Login successful!",
        user: backendData.user,
        accessToken: accessToken,
      },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    console.error("Login Proxy API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error during authentication." },
      { status: 500 }
    );
  }
}
