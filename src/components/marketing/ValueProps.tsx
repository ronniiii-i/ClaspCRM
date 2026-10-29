import { marketingCopy } from "@/content/marketing";

export function ValueProps() {
  return (
    <section id="value" className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Designed for structure without rigidity
          </h2>
          <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
            Shape access, scope, and visibility to match the way your teams actually operate.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {marketingCopy.valueProps.map((prop) => (
            <article key={prop.title} className="flex flex-col gap-3 rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                {prop.title}
              </h3>
              <p className="text-sm leading-6 text-pretty text-muted-foreground">
                {prop.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
