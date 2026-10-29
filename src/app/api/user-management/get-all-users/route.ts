import { NextResponse } from "next/server";

const NESTJS_BACKEND_USERS_URL = `${process.env.NEXT_PUBLIC_API}/users`;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authentication failed: No token provided." },
        { status: 401 },
      );
    }

    const backendResponse = await fetch(NESTJS_BACKEND_USERS_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    return NextResponse.json(backendData, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error while fetching users." },
      { status: 500 },
    );
  }
}
