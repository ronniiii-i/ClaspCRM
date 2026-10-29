import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://claspworkspace.work.gd";
const AUTHOR_NAME = "Princess Roni Egbu";
const AUTHOR_URL = "https://roniegbu.vercel.app";

const DEFAULT_TITLE =
  "Clasp Workspace | One Place for Your Entire Team & Business";
const DEFAULT_DESCRIPTION =
  "Clasp Workspace is an all-in-one business management platform that brings your departments, projects, tasks, finances, and team docs together into one customizable space.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Clasp Workspace",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Clasp Workspace",
    "Princess Roni Egbu",
    "Roni Egbu",
    "Princess Egbu",
    "Team Workspace",
    "Business Management Software",
    "All-In-One Team Platform",
    "Project & Task Tracker",
    "Department Workspace",
    "Expense & Budget Tracking",
    "Company Wiki & Documentation",
    "Custom Team Workflows",
    "Team Collaboration Tool",
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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
        description: DEFAULT_DESCRIPTION,
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
}): Metadata {
  const metaTitle = title ? `${title} | Clasp Workspace` : DEFAULT_TITLE;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const metaUrl = url || SITE_URL;
  const metaImages = image
    ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || "Clasp Workspace",
        },
      ]
    : [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Clasp Workspace",
        },
      ];

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Clasp Workspace",
      title: metaTitle,
      description: metaDesc,
      url: metaUrl,
      images: metaImages,
    },
    twitter: {
      card: "summary_large_image",
      site: "@ronniiii_i",
      creator: "@ronniiii_i",
      title: metaTitle,
      description: metaDesc,
      images: metaImages.map((img) => img.url),
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
