export const marketingCopy = {
  hero: {
    title: "The CRM that adapts to your company's DNA.",
    subtitle:
      "Don't force your team into rigid software. Build dynamic departments, custom roles, and isolated workspaces tailored to your operations.",
    primaryCta: "Create your Workspace",
    secondaryCta: "Sign in",
  },
  valueProps: [
    {
      title: "True Granularity",
      body: "Stop bending your process to fit the tool. Define departments that reflect how you actually work, assign custom roles with precise permissions, and control exactly who sees what without over-provisioning access.",
    },
    {
      title: "Absolute Security",
      body: "Every workspace is isolated at the data layer. Tenant boundaries are enforced in the database with row-level security, sessions are versioned and revocable, and privileged actions are gated by explicit permissions with full auditability.",
    },
    {
      title: "Abstracted Leadership",
      body: "Give leaders a clean view of what matters. Department and team scopes roll up the right metrics without exposing sensitive records across the organization, so managers can act without micromanaging or overreaching.",
    },
  ],
  builtFor: {
    title: "Built for operators",
    body: "Clasp Workspace stays out of your way. No bloated feature lists, no decorative noise—just a focused foundation you can shape to fit your business as it evolves.",
  },
} as const;
