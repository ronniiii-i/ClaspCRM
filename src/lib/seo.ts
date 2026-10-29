import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://claspworkspace.work.gd";
const AUTHOR_NAME = "Princess Roni Egbu";
const AUTHOR_URL = "https://roniegbu.vercel.app";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clasp Workspace | One Place for Your Entire Team & Business",
    template: "%s | Clasp Workspace",
  },
  description:
    "Clasp Workspace is an all-in-one business management platform that brings your departments, projects, tasks, finances, and team docs together into one customizable space.",
  keywords: [
    // Brand & Author
    "Clasp Workspace",
    "Princess Roni Egbu",
    "Roni Egbu",
    "Princess Egbu",

    // Everyday Business Concepts
    "Team Workspace",
    "Business Management Software",
    "All-In-One Team Platform",
    "Project & Task Tracker",
    "Department Workspace",
    "Expense & Budget Tracking",
    "Company Wiki & Documentation",
    "Custom Team Workflows",
    "Team Collaboration Tool",

    // Portfolio Context
    "Fullstack Software Engineering Showcase",
    "Software Engineer Portfolio",
  ],
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Clasp Workspace",
    title: "Clasp Workspace | Run Your Business in One Flexible Space",
    description:
      "Manage projects, track departmental budgets, organize team docs, and streamline daily operations in one simple workspace built by Roni Egbu.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Clasp Workspace — All-in-one business management platform built by Roni Egbu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ronniiii_i",
    creator: "@ronniiii_i",
    title: "Clasp Workspace | One Place for Your Entire Team & Business",
    description:
      "Organize team tasks, track budgets, write company docs, and run your departments smoothly in one workspace.",
    images: [`${SITE_URL}/og-image.png`],
  },
  manifest: "/site.webmanifest",
  category: "Business",
  applicationName: "Clasp Workspace",

  other: {
    "application/ld+json": JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Clasp Workspace",
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description:
          "An all-in-one platform for teams to manage departments, track tasks, handle finances, and share company documentation.",
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: AUTHOR_URL,
        },
        creator: {
          "@type": "Person",
          name: AUTHOR_NAME,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Clasp Workspace",
        url: SITE_URL,
        author: {
          "@type": "Person",
          name: AUTHOR_NAME,
          url: AUTHOR_URL,
        },
      },
    ]),
  },
};

export function generatePageMetadata({
  title,
  description,
  image,
  url,
  type = "WebPage",
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "FAQPage" | "Service";
}) {
  const metaTitle = title
    ? `${title} | Clasp Workspace`
    : defaultMetadata.title;
  const metaDesc = description || defaultMetadata.description;
  const metaUrl = url || SITE_URL;

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: metaTitle,
      description: metaDesc,
      url: metaUrl,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title || "Clasp Workspace",
            },
          ]
        : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: metaTitle,
      description: metaDesc,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": type,
        name: title || "Clasp Workspace",
        url: metaUrl,
        description: metaDesc,
      }),
    },
  };
}
