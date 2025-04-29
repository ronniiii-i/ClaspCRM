"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { initializeSessionTracking, setupTokenRefresh } from "@/lib/auth";
import { Toaster } from "sonner"; 
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (token) {
      initializeSessionTracking();
      setupTokenRefresh(3600);
    }

    return () => {
      // Cleanup function to remove event listeners when component unmounts
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
        window.removeEventListener(event, initializeSessionTracking);
      });
    };
  }, [token]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar (updated) */}
      <aside
        className={`fixed top-0 bottom-0 lg:relative z-50 md:w-64 sm:w-full flex-col border-r bg-background transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col w-full overflow-hidden">
        <Navbar>
          {/* Add mobile menu button to navbar */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </Navbar>

        <main className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          {children}

          {/* Session timeout warning modal */}
          <SessionTimeoutWarning />

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />
        </main>
      </div>
    </div>
  );
}
