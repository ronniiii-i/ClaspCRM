/**
 * Centralised HTTP client for authenticated workspace requests.
 *
 * - Prefixes `NEXT_PUBLIC_API`.
 * - Sends the bearer token from the auth store unless an explicit token is
 *   supplied (the ACL service does this so its public API stays stable).
 * - Throws a typed `ApiError` with the backend error code.
 * - Clears the session and redirects on 401.
 */

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode = "UNKNOWN",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static is(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export interface ApiRequestOptions extends RequestInit {
  /** Overrides the token read from the auth store. */
  token?: string | null;
  /** Prefix for the thrown error message. */
  errorMessage?: string;
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers as Record<string, string>) };
}

async function readBody(response: Response): Promise<unknown> {
  if (typeof response.text === "function") {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  if (typeof response.json === "function") {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return null;
}

function errorCodeFrom(status: number, payload: unknown): ApiErrorCode {
  const body = payload as
    | { code?: unknown; message?: { code?: unknown } | string }
    | null;
  const explicit = body?.code ?? (typeof body?.message === "object" ? body.message?.code : undefined);
  if (typeof explicit === "string" && explicit.length > 0) {
    return explicit as ApiErrorCode;
  }

  switch (status) {
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 400:
    case 422:
      return "VALIDATION";
    default:
      return "UNKNOWN";
  }
}

function messageFrom(
  status: number,
  statusText: string,
  payload: unknown,
  fallbackPrefix: string,
): string {
  const body = payload as
    | { message?: string | string[] | { message?: string } }
    | null;
  const raw = body?.message;
  if (typeof raw === "string" && raw.length > 0) {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw.length > 0
      ? raw.join(", ")
      : `${fallbackPrefix}: ${status} ${statusText}`.trim();
  }
  if (raw && typeof raw === "object" && typeof raw.message === "string") {
    return raw.message;
  }
  return `${fallbackPrefix}: ${status} ${statusText}`.trim();
}

async function storedToken(): Promise<string | null> {
  // Loaded lazily so importing the API client does not pull the whole auth
  // store (and `next/server`) into every consumer.
  const { useAuthStore } = await import("@/stores/auth-store");
  return useAuthStore.getState().token;
}

async function handleUnauthorized(): Promise<void> {
  if (typeof window === "undefined") return;

  const { useAuthStore } = await import("@/stores/auth-store");
  const state = useAuthStore.getState();
  if (state.token || state.user) {
    useAuthStore.setState({ token: null, user: null });
  }

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API ?? "").replace(/\/+$/, "");
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    token,
    errorMessage: fallbackPrefix = "Request failed",
    headers: headerInit,
    ...init
  } = options;

  const headers = toHeaderRecord(headerInit);
  const authToken = token === undefined ? await storedToken() : token;

  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (init.body && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });

  const payload = await readBody(response);

  if (!response.ok) {
    if (response.status === 401) await handleUnauthorized();

    throw new ApiError(
      messageFrom(
        response.status,
        response.statusText,
        payload,
        fallbackPrefix,
      ),
      response.status,
      errorCodeFrom(response.status, payload),
      payload,
    );
  }

  return payload as T;
}
