import Link from "next/link";
import { marketingCopy } from "@/content/marketing";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "./ProductPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(161,161,170,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(113,113,122,0.18),_transparent_60%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {marketingCopy.hero.title}
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">
              {marketingCopy.hero.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90">
              <Link href="/create-workspace">{marketingCopy.hero.primaryCta}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">{marketingCopy.hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
