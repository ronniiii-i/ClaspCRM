"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Using Lucide icons

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ];

  if (!isMounted) return null;

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  ClaspCRM
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === link.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <button
                onClick={() => router.push("/login")}
                className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Login
              </button>

              {/* Mobile menu button (using Lucide's Menu/X) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" /> // Lucide's X icon
                ) : (
                  <Menu className="h-6 w-6" /> // Lucide's Menu icon
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 sm:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="h-6 w-6" /> {/* Lucide's X icon */}
              </button>
            </div>

            <nav className="flex-1 flex flex-col space-y-4 mt-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 text-base font-medium ${
                    pathname === link.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto mb-8 flex flex-col space-y-4">
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/login");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
