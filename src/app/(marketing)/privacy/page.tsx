export default function PrivacyPage() {
  return (
    <section>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: October 26, 2026</p>
        </div>
        <div className="flex flex-col gap-4 text-base leading-7 text-muted-foreground">
          <p>
            ClaspCRM is designed with tenant isolation as a core principle. Your workspace data is separated at the database
            level and access is strictly controlled by permissions.
          </p>
          <p>
            We only collect information necessary to provide the service, such as account details and workspace
            configuration. We do not sell your data.
          </p>
        </div>
      </div>
    </section>
  );
}
