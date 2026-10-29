// testDashboardApi.ts

// const fetch = require('node-fetch'); 
const dotenv = require('dotenv'); // To load .env variables

// Load environment variables from a .env file (if you have one for NEXT_PUBLIC_API)
dotenv.config();

// --- Configuration ---
// IMPORTANT: Replace with your actual backend URL.
// If your Next.js frontend runs on localhost:3000 and proxies to the backend,
// use the proxy URL for login and the direct backend URL for dashboard.
// If NEXT_PUBLIC_API points directly to your NestJS backend, use that for all calls.
const NESTJS_BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API || "http://localhost:3030";
const LOGIN_ENDPOINT = `${NESTJS_BACKEND_BASE_URL}/auth/login`;
const DASHBOARD_ENDPOINT = `${NESTJS_BACKEND_BASE_URL}/dashboard`; // Assuming this is your dashboard API

// Replace with credentials of a user in your system (e.g., an ADMIN user)
const TEST_USER_EMAIL = "admin@crm.com";
const TEST_USER_PASSWORD = "admin123";

// --- Functions to interact with your API ---

/**
 * Logs in a user and returns the accessToken.
 * This simulates your frontend's login process that gets the token from the backend.
 */
async function login(): Promise<string> {
  console.log(`Attempting to log in as ${TEST_USER_EMAIL}...`);
  try {
    const res = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Login failed:", error);
      throw new Error(
        (typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: string }).message === "string")
          ? (error as { message: string }).message
          : `Login failed with status: ${res.status}`
      );
    }

    const data = (await res.json()) as { accessToken?: string };
    const { accessToken } = data;

    if (!accessToken) {
      throw new Error(
        "Login successful, but no accessToken found in response body."
      );
    }

    console.log("Login successful! Access token received.");
    return accessToken;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

/**
 * Fetches dashboard data using the provided accessToken.
 */
async function fetchDashboardData(
  accessToken: string,
  period?: "week" | "month" | "year"
): Promise<any> {
  let url = DASHBOARD_ENDPOINT;
  if (period) {
    url = `${DASHBOARD_ENDPOINT}/attendance-chart?period=${period}`; // Adjust if you have a separate chart endpoint
  }

  console.log(`Fetching dashboard data from: ${url}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // The key part for your backend
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Dashboard data fetch failed:", {
        status: res.status,
        statusText: res.statusText,
        body: errorBody,
      });
      throw new Error(
        `Failed to fetch dashboard data: ${res.statusText} - ${errorBody}`
      );
    }

    const data = await res.json();
    console.log("Successfully fetched dashboard data:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// --- Main execution flow ---
async function main() {
  try {
    // 1. Log in to get the access token
    const token = await login();

    // 2. Use the token to fetch general dashboard data
    console.log("\n--- Fetching General Dashboard Data ---");
    await fetchDashboardData(token);

    // 3. Use the token to fetch attendance chart data for a specific period
    console.log("\n--- Fetching Attendance Chart Data (Month) ---");
    await fetchDashboardData(token, "month");
  } catch (error) {
    console.error("\nScript failed:", error);
  }
}

main();
