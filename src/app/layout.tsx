// src/app/layout.tsx
import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
// import { CaptchaProvider } from "@/providers/captcha-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaspCRM Intranet",
  description: "Complete Business Management Solution",
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
        {/* <CaptchaProvider> */}
        {children}
        {/* </CaptchaProvider> */}
      </body>
    </html>
  );
}
