// src/app/layout.tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { geistSans, geistMono } from "@/lib/fonts";
import { defaultMetadata } from "@/lib/seo";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";


export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children} </ThemeProvider>
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
