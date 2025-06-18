// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

// Use the environment variable from your Next.js project to get the backend URL
const NESTJS_BACKEND_LOGIN_URL = `${process.env.NEXT_PUBLIC_API}/auth/login`;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Forward the login request to your NestJS backend (server-to-server)
    const backendResponse = await fetch(NESTJS_BACKEND_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Propagate error from backend to frontend
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

    // 2. Set the httpOnly cookie on the Next.js frontend's domain (claspcrm.vercel.app)
    const cookie = serialize("access_token", accessToken, {
      httpOnly: true, // Makes it inaccessible to client-side JS
      secure: process.env.NODE_ENV === "production", // Vercel is HTTPS, so this will be true
      sameSite: "lax", // 'lax' is appropriate for same-site (claspcrm.vercel.app)
      path: "/", // Cookie accessible across all paths on claspcrm.vercel.app
      maxAge: 3600000, // 1 hour (make sure this aligns with JWT expiration)
    });

    // 3. Create the response object and set the cookie header
    const response = NextResponse.json(
      {
        success: true,
        message: backendData.message || "Login successful!",
        user: backendData.user,
        accessToken: accessToken, // <--- Send token in body for localStorage (Choice A)
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
