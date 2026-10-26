export function ProductPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-6 -top-6 -bottom-6 -z-10 bg-[linear-gradient(to_right,transparent,rgba(161,161,170,0.08)_1px,transparent_1px),linear-gradient(to_bottom,transparent,rgba(161,161,170,0.08)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 dark:opacity-40" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          </div>
          <div className="text-xs text-muted-foreground">acme.claspcrm.com/dashboard</div>
        </div>
        <div className="grid grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-border p-4 sm:flex sm:flex-col sm:gap-3">
            <div className="h-2 w-24 rounded-full bg-foreground/80" />
            <div className="mt-2 flex flex-col gap-2">
              <div className="h-2 w-16 rounded-full bg-foreground/70" />
              <div className="h-2 w-20 rounded-full bg-muted-foreground/60" />
              <div className="h-2 w-18 rounded-full bg-muted-foreground/60" />
              <div className="h-2 w-14 rounded-full bg-muted-foreground/60" />
            </div>
            <div className="mt-4 h-2 w-20 rounded-full bg-muted-foreground/50" />
            <div className="flex flex-col gap-2">
              <div className="h-2 w-16 rounded-full bg-muted-foreground/60" />
              <div className="h-2 w-18 rounded-full bg-muted-foreground/60" />
            </div>
          </aside>
          <main className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-40 rounded-full bg-foreground/80" />
              <div className="h-2 w-56 rounded-full bg-muted-foreground/60" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <div className="h-2 w-20 rounded-full bg-muted-foreground/60" />
                  <div className="h-6 w-16 rounded-full bg-foreground/80" />
                  <div className="h-2 w-24 rounded-full bg-muted-foreground/50" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <div className="h-2 w-28 rounded-full bg-foreground/70" />
              <div className="mt-2 flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="h-2 w-32 rounded-full bg-muted-foreground/60" />
                    <div className="h-2 w-12 rounded-full bg-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
