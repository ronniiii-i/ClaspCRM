import "../globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClaspCRM",
  description: "Complete Business Management Solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <>
            <PublicNavbar />
            {children}
            <Footer />
          </>
        </ThemeProvider>
      </body>
    </html>
  );
}
