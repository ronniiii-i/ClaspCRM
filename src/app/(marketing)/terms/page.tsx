export default function TermsPage() {
  return (
    <section>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: October 26, 2026</p>
        </div>
        <div className="flex flex-col gap-4 text-base leading-7 text-muted-foreground">
          <p>
            By using Clasp Workspace, you agree to use the service responsibly and in compliance with applicable laws. Workspaces
            remain the responsibility of their administrators.
          </p>
          <p>
            Clasp Workspace is provided as-is with the goal of delivering a secure, flexible foundation for managing your
            business processes.
          </p>
        </div>
      </div>
    </section>
  );
}
