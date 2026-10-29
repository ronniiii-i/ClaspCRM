import { NextResponse } from "next/server";

const NESTJS_BACKEND_CREATE_USER_URL = `${process.env.NEXT_PUBLIC_API}/users`;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const userData = await request.json();

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authentication failed: No token provided." },
        { status: 401 },
      );
    }

    const backendResponse = await fetch(NESTJS_BACKEND_CREATE_USER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(userData),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    return NextResponse.json(backendData, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error while creating user." },
      { status: 500 },
    );
  }
}
