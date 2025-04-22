import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    question: "What is ClaspCRM?",
    answer:
      "ClaspCRM is a comprehensive business management platform that integrates all aspects of your operations including contact management, project tracking, HR, inventory, and more into one unified system.",
  },
  {
    question: "How does the pricing work?",
    answer:
      "We offer tiered pricing based on your business needs. Our Starter plan is perfect for small teams, while our Professional and Enterprise plans offer more advanced features for growing and large businesses respectively.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial for all our plans with no credit card required. You can explore all features during this period.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely. You can change your plan at any time from your account settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "How secure is my data?",
    answer:
      "Security is our top priority. We use enterprise-grade encryption, regular backups, and comply with industry-standard security protocols to keep your data safe.",
  },
  {
    question: "What support options are available?",
    answer:
      "All plans include email support. Professional and Enterprise plans include priority support with faster response times. Enterprise customers also get a dedicated account manager and 24/7 phone support.",
  },
  {
    question: "Can I integrate with other tools?",
    answer:
      "Yes, we offer API access (on Professional and Enterprise plans) and pre-built integrations with popular business tools like accounting software, email marketing platforms, and more.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up for an account and follow the onboarding process. We'll guide you through setting up your account, importing data, and training your team.",
  },
];

export default function FAQ() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Got questions? We have answers. Here are some of the most common
              queries we receive from our users.
            </p>
          </div>
          <div className="mt-20">
            <div className="space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
              {faqs.map((faq, index) => (
                <div key={index} className="pt-8 first:pt-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {faq.question}
                  </h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Still have questions?
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Can&apos;t find the answer you&apos;re looking for? Our team is
                happy to help.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
