import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "Free during trial",
    description: "Explore Clasp Workspace with your team on a 14-day trial.",
    features: ["Dynamic departments", "Custom roles", "Core workspace modules", "Email support"],
    cta: "Create your Workspace",
    href: "/create-workspace",
    featured: false,
  },
  {
    name: "Team",
    price: "Contact us",
    description: "Scale with governance, scope, and visibility controls.",
    features: [
      "Everything in Starter",
      "Department-level scoping",
      "Delegated invitations",
      "Priority support",
    ],
    cta: "Talk to sales",
    href: "/contact",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description: "Tailored to your organization's needs and processes.",
    features: [
      "Everything in Team",
      "Custom onboarding",
      "Policy alignment",
      "Dedicated support channel",
    ],
    cta: "Contact us",
    href: "/contact",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-pretty text-muted-foreground">
            Start with a 14-day trial. No credit card required.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.featured ? "border-foreground/20 shadow-sm" : "border-border"}
            >
              <CardHeader className="gap-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-2xl font-semibold tracking-tight text-foreground">{plan.price}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/70" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={plan.featured ? "bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90" : ""}
                  variant={plan.featured ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
