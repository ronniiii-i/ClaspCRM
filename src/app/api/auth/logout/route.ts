// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

const NESTJS_BACKEND_LOGOUT_URL = `${process.env.NEXT_PUBLIC_API}/auth/logout`;

export async function POST(request: Request) {
  // Clear the httpOnly cookie first, regardless of backend logout success
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );
  response.headers.set(
    "Set-Cookie",
    serialize("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Set to a past date to expire the cookie immediately
    })
  );

  try {
    // Attempt to notify the NestJS backend to invalidate the token.
    // The browser will automatically send the httpOnly 'access_token' cookie
    // to this proxy route if it exists, due to it being a same-site request.
    // Then, the 'credentials: "include"' on the fetch to the backend will forward it.

    // Get the cookie from the incoming request to this proxy
    const incomingCookies = request.headers.get("Cookie");

    // Forward the cookie to the backend if present
    const backendHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (incomingCookies) {
      backendHeaders["Cookie"] = incomingCookies; // Forward all cookies
    }

    const backendResponse = await fetch(NESTJS_BACKEND_LOGOUT_URL, {
      method: "POST",
      headers: backendHeaders,
      credentials: "include", // Ensure the httpOnly cookie (if any) is sent to NestJS backend
      // No body needed unless your backend logout specifically requires one
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(
        "Backend logout notification failed:",
        backendResponse.status,
        errorText
      );
      // You might choose to send a non-200 status back if backend logout is critical
      // For now, we prioritize client-side logout even if backend fails to respond.
    } else {
      console.log("Backend logout notification successful.");
    }
  } catch (error) {
    console.error("Logout Proxy API Error:", error);
    // Even on error, the httpOnly cookie has already been cleared in the response header.
  }

  return response;
}
