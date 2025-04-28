import { NextRequest } from "next/server";

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Registration failed");
  }

  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<{
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
    department: {
      id: string;
      name: string;
    };
    managedDepartment: {
      id: string;
      name: string;
    };
  };
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();

  // Ensure the response has the expected structure
  const formattedResponse = {
    accessToken: data.accessToken,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      isVerified: data.user.isVerified,
      department: data.user.department || null,
      managedDepartment: data.user.managedDepartment || null,
    },
  };

  if (typeof window !== "undefined") {
    document.cookie = `token=${formattedResponse.accessToken}; Path=/; Secure; SameSite=Strict`;
    localStorage.setItem("token", formattedResponse.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(formattedResponse.user));
  }

  // console.log(formattedResponse);
  return formattedResponse;
}

export function getToken(request?: NextRequest) {
  if (request) {
    // Server-side (middleware)
    return request.cookies.get("token")?.value;
  } else if (typeof document !== "undefined") {
    // Client-side
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  }
  return null;
}

export async function logout() {
  try {
    // First call the backend logout endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    // Then clear client-side storage
    if (typeof window !== "undefined") {
      // Clear token from cookies
      document.cookie =
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      // Clear token and user from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend logout fails, clear client-side storage
    if (typeof window !== "undefined") {
      document.cookie =
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
    throw error;
  }
}

// export function logout() {
//   if (typeof window !== "undefined") {
//     // Clear token from cookies
//     document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
//     // Clear token from localStorage if you're using it
//     localStorage.removeItem("token");
//   }
// }

// export function getToken() {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("token");
//   }
//   return null;
// }
