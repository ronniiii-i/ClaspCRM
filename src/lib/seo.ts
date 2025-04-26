import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://claspcrm.vercel.app"),
  title: {
    default: "ClaspCRM | Built by Roni Egbu",
    template: "%s | ClaspCRM by Roni Egbu",
  },
  description:
    "ClaspCRM is a complete business management solution built by Roni Egbu, a frontend developer passionate about creating scalable software.",
  keywords: [
    "Princess Roni Egbu",
    "Roni Egbu",
    "CRM",
    "Business Management",
    "Project Management",
    "HR Management",
    "Frontend Developer Portfolio",
    "ClaspCRM",
    "Enterprise Tools",
    "Next.js Projects",
    "NestJS Projects",
    "Fullstack Portfolio",
  ],
  authors: [{ name: "Roni Egbu", url: "https://roniegbu.vercel.app" }],
  creator: "Roni Egbu",
  publisher: "Roni Egbu",
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
    url: "https://claspcrm.vercel.app",
    siteName: "ClaspCRM by Roni Egbu",
    title: "ClaspCRM | Built by Roni Egbu",
    description:
      "Manage your business smarter with ClaspCRM — a CRM built by Roni Egbu, frontend developer and software engineer.",
    images: [
      {
        url: "https://claspcrm.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Screenshot of ClaspCRM dashboard built by Roni Egbu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ronniiii_i",
    creator: "@ronniiii_i",
    title: "ClaspCRM | Built by Roni Egbu",
    description:
      "Manage your business smarter with ClaspCRM — built by Roni Egbu.",
    images: ["https://claspcrm.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "Portfolio",
  applicationName: "ClaspCRM",

  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ClaspCRM",
      url: "https://claspcrm.vercel.app",
      author: {
        "@type": "Person",
        name: "Roni Egbu",
        url: "https://roniegbu.vercel.app",
      },
      description:
        "ClaspCRM is a business management solution built by Roni Egbu, a frontend developer passionate about scalable software.",
      publisher: {
        "@type": "Person",
        name: "Roni Egbu",
      },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://claspcrm.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  },
};


export function generatePageMetadata({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  return {
    title: title ? `${title} | ClaspCRM by Roni Egbu` : defaultMetadata.title,
    description: description || defaultMetadata.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title ? `${title} | ClaspCRM by Roni Egbu` : defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
      url: url || defaultMetadata.openGraph?.url,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title || "ClaspCRM",
            },
          ]
        : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title ? `${title} | ClaspCRM by Roni Egbu` : defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
  };
}

