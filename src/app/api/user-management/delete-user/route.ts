import { NextResponse } from "next/server";

const NESTJS_BACKEND_DELETE_USER_URL = `${process.env.NEXT_PUBLIC_API}/users`;

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = await request.json();

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authentication failed: No token provided." },
        { status: 401 },
      );
    }

    const backendResponse = await fetch(
      `${NESTJS_BACKEND_DELETE_USER_URL}/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      },
    );

    if (!backendResponse.ok) {
      const backendData = await backendResponse.json();
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error while deleting user." },
      { status: 500 },
    );
  }
}
