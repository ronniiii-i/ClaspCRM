// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  ClipboardList,
  IdCard as Identification,
  BarChart as ChartBar,
  CreditCard,
  Truck,
  Archive,
  Lock as LockClosed,
  Building as OfficeBuilding,
  ShieldCheck,
  Cog,
  PlusCircle,
} from "lucide-react";
import Navbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex flex-col lg:flex-row max-w-7xl flex-1 mx-auto">
          <div className="max-w-7xl flex-1 mx-auto">
            <div className="relative z-10 pb-8 bg-white dark:bg-gray-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                    <span className="block">Complete Business</span>
                    <span className="block text-blue-600">
                      Management Solution
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    All-in-one platform to manage your contacts, projects, HR,
                    inventory, and more. Designed for enterprises that need
                    comprehensive control.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="#demo"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
                      >
                        Live demo
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className=" flex-1 lg:inset-y-0 lg:right-0 lg:w-1/2 z-10">
            <Image
              className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
              src="https://picsum.photos/1600/900?random=1"
              alt="CRM dashboard"
              width={1600}
              height={900}
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Powerful tools for your business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Everything you need to manage your entire enterprise in one
              platform.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Unified Platform
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  All your business functions integrated into one system with
                  seamless data flow between modules.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Enterprise Security
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Role-based access control, audit logs, and compliance features
                  to protect your sensitive data.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Real-time Analytics
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Custom dashboards and reports with live data updates for
                  informed decision-making.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Workflow Automation
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-300">
                  Automate repetitive tasks and create custom workflows to boost
                  your team&apos;s productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div id="modules" className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Modules
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Comprehensive Business Solutions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              All the tools you need to run your entire operation.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Contact Management",
                  icon: <Users className="w-5 h-5 text-white" />,
                  desc: "Centralize all customer interactions and communication history",
                },
                {
                  name: "Project Management",
                  icon: <ClipboardList className="w-5 h-5 text-white" />,
                  desc: "Plan, track, and collaborate on projects with your team",
                },
                {
                  name: "HR Management",
                  icon: <Identification className="w-5 h-5 text-white" />,
                  desc: "Manage employees, payroll, benefits, and performance",
                },
                {
                  name: "Business Intelligence",
                  icon: <ChartBar className="w-5 h-5 text-white" />,
                  desc: "Advanced analytics and reporting for data-driven decisions",
                },
                {
                  name: "Account Management",
                  icon: <CreditCard className="w-5 h-5 text-white" />,
                  desc: "Track financial transactions, invoices, and payments",
                },
                {
                  name: "Supply Chain",
                  icon: <Truck className="w-5 h-5 text-white" />,
                  desc: "Manage vendors, procurement, and logistics operations",
                },
                {
                  name: "Materials Inventory",
                  icon: <Archive className="w-5 h-5 text-white" />,
                  desc: "Real-time tracking of stock levels and inventory movement",
                },
                {
                  name: "Access Control",
                  icon: <LockClosed className="w-5 h-5 text-white" />,
                  desc: "Granular permissions and security management",
                },
                {
                  name: "Office Administration",
                  icon: <OfficeBuilding className="w-5 h-5 text-white" />,
                  desc: "Facilities management and administrative tools",
                },
                {
                  name: "Health and Safety",
                  icon: <ShieldCheck className="w-5 h-5 text-white" />,
                  desc: "Compliance tracking and incident management",
                },
                {
                  name: "Settings",
                  icon: <Cog className="w-5 h-5 text-white" />,
                  desc: "System configuration and customization options",
                },
                {
                  name: "Additional Modules",
                  icon: <PlusCircle className="w-5 h-5 text-white" />,
                  desc: "Expandable platform with room for future growth",
                },
              ].map((module) => (
                <div key={module.name} className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 shadow h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          {/* <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={`M12 6v6m0 0v6m0-6h6m-6 0H6`}
                            />
                          </svg> */}
                          {module.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                        {module.name}
                      </h3>
                      <p className="mt-5 text-base text-gray-500 dark:text-gray-300">
                        {module.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Preview */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
              See it in action
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Powerful yet intuitive interface
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-300">
              Designed for efficiency without sacrificing usability.
            </p>
          </div>
          <div className="mt-12">
            <Image
              className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-600"
              src="https://picsum.photos/1600/900?random=2"
              alt="App screenshot"
              width={1600}
              height={900}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform your business?</span>
            <span className="block">Start using ClaspCRM today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join forward-thinking companies that trust us with their operations.
          </p>
          <Link
            href="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
          >
            Get started for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
