import Link from "next/link";

/**
 * Standalone 404 shown to visitors who are not signed in (and to anyone who
 * lands on an unknown public URL). It intentionally has no app chrome.
 */
export function PublicNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Clasp Workspace
      </p>
      <h1 className="mt-4 text-7xl font-black tracking-tight">404</h1>
      <h2 className="mt-2 text-2xl font-semibold">Page not found</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist, was moved, or is only
        available to signed-in users.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
