import Link from "next/link";
import { marketingCopy } from "@/content/marketing";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Build a workspace that fits your company
          </h2>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            {marketingCopy.builtFor.body}
          </p>
        </div>
        <Button asChild size="lg" className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90">
          <Link href="/create-workspace">{marketingCopy.hero.primaryCta}</Link>
        </Button>
      </div>
    </section>
  );
}
