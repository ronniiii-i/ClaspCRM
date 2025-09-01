// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://claspcrm.vercel.app", // <-- put YOUR real domain here
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/dashboard",
          "/profile",
          "/admin",
          // "/api", // API routes shouldn't be indexed
        ],
      },
    ],
    additionalSitemaps: ["https://claspcrm.vercel.app/sitemap.xml"],
  },
};
// This is the configuration file for next-sitemap, a library to generate sitemaps and robots.txt files for Next.js applications.
