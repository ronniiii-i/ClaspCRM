import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://claspworkspace.com"),
  title: {
    default: "Clasp Workspace | Built by Roni Egbu",
    template: "%s | Clasp Workspace by Roni Egbu",
  },
  description:
    "Clasp Workspace is a complete business management solution built by Roni Egbu, a fullstack developer passionate about creating scalable software.",
  keywords: [
    "Princess Roni Egbu",
    "Roni Egbu",
    "Princess Egbu",
    "CRM",
    "B2B",
    "B2C",
    "SaaS",
    "Business Management",
    "Business Management Software",
    "Business Management System",
    "Business Management Tools",
    "Fullstack Developer Portfolio",
    "Clasp Workspace",
    "Enterprise Tools",
    "Software as a Service",
    "Next.js Projects",
    "NestJS Projects",
    "Fullstack Portfolio",
    "Portfolio",
    "Software Engineer",
    "Software Engineer Portfolio",
    
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
    url: "https://claspworkspace.com",
    siteName: "Clasp Workspace by Roni Egbu",
    title: "Clasp Workspace | Built by Roni Egbu",
    description:
      "Manage your business smarter with Clasp Workspace — a CRM built by Roni Egbu, fullstack developer and software engineer.",
    images: [
      {
        url: "https://claspworkspace.com/og-image.png",
        width: 1905,
        height: 870,
        alt: "Screenshot of Clasp Workspace dashboard built by Roni Egbu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ronniiii_i",
    creator: "@ronniiii_i",
    title: "Clasp Workspace | Built by Roni Egbu",
    description:
      "Manage your business smarter with Clasp Workspace — built by Roni Egbu.",
    images: ["https://claspworkspace.com/og-image.png"],
  },
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon-16x16.png",
//     apple: "/apple-touch-icon.png",
//     other: [
//       {
//         rel: "mask-icon",
//         url: "/safari-pinned-tab.svg",
//         color: "#5bbad5",
//       },
//     ],
//   },
  manifest: "/site.webmanifest",
  category: "Portfolio",
  applicationName: "Clasp Workspace",

  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Clasp Workspace",
      url: "https://claspworkspace.com",
      author: {
        "@type": "Person",
        name: "Roni Egbu",
        url: "https://roniegbu.vercel.app",
      },
      description:
        "Clasp Workspace is a business management solution built by Roni Egbu, a fullstack developer passionate about scalable software.",
      publisher: {
        "@type": "Person",
        name: "Roni Egbu",
      },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://claspworkspace.com/search?q={search_term_string}",
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
  type = "WebPage",
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "FAQPage" | "Service";
}) {
  return {
    title: title ? `${title} | Clasp Workspace by Roni Egbu` : defaultMetadata.title,
    description: description || defaultMetadata.description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title
        ? `${title} | Clasp Workspace by Roni Egbu`
        : defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
      url: url || defaultMetadata.openGraph?.url,
      type: "website",
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
      title: title
        ? `${title} | Clasp Workspace by Roni Egbu`
        : defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": type,
        name: title,
        url,
        description,
      }),
    },
  };
}

