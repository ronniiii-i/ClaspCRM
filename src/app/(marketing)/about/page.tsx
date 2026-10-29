export default function AboutPage() {
  return (
    <section>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            About Clasp Workspace
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">
            Clasp Workspace is built around a simple idea: software should adapt to your organization, not the other way around.
          </p>
        </div>
        <div className="flex flex-col gap-6 text-base leading-7 text-muted-foreground">
          <p>
            Most CRMs force every team into the same structure. Clasp Workspace takes the opposite approach—giving you the tools to
            model your company as it actually exists. Define departments, create roles with precise permissions, and keep
            data isolated where it needs to be.
          </p>
          <p>
            We focus on clarity, security, and control. The interface is deliberately minimal, so your team can focus on
            work instead of navigating complexity.
          </p>
        </div>
      </div>
    </section>
  );
}
