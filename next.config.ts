import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  allowedDevOrigins: ["*.localhost:3000"],
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
