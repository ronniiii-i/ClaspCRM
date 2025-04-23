// src/app/(dashboard-pages)/layout.tsx
"use client";

import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
