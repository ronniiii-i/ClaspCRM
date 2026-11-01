import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  allowedDevOrigins: ["*.localhost:3000"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/create-workspace",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/features",
        destination: "/#value",
        permanent: true,
      },
      {
        source: "/demo",
        destination: "/create-workspace",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/support/:path*",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
