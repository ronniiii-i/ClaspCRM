import Navbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mt-20 prose prose-lg text-gray-500 dark:text-gray-300 mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Introduction
            </h2>
            <p>
              ClaspCRM (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;)
              operates the ClaspCRM website and platform (the
              &quot;Service&quot;). This page informs you of our policies
              regarding the collection, use, and disclosure of personal data
              when you use our Service and the choices you have associated with
              that data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              Information Collection and Use
            </h2>
            <p>
              We collect several different types of information for various
              purposes to provide and improve our Service to you.
            </p>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">
              Types of Data Collected
            </h3>
            <p>
              <strong>Personal Data:</strong> While using our Service, we may
              ask you to provide us with certain personally identifiable
              information that can be used to contact or identify you
              (&quot;Personal Data&quot;). Personally identifiable information
              may include, but is not limited to:
            </p>
            <ul className="list-disc pl-5">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Business name</li>
              <li>Cookies and Usage Data</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-6">
              Usage Data
            </h3>
            <p>
              We may also collect information how the Service is accessed and
              used (&quot;Usage Data&quot;). This Usage Data may include
              information such as your computer&apos;s Internet Protocol address
              (e.g. IP address), browser type, browser version, the pages of our
              Service that you visit, the time and date of your visit, the time
              spent on those pages, unique device identifiers and other
              diagnostic data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              Use of Data
            </h2>
            <p>ClaspCRM uses the collected data for various purposes:</p>
            <ul className="list-disc pl-5">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>
                To allow you to participate in interactive features of our
                Service when you choose to do so
              </li>
              <li>To provide customer support</li>
              <li>
                To gather analysis or valuable information so that we can
                improve our Service
              </li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              Security of Data
            </h2>
            <p>
              The security of your data is important to us, but remember that no
              method of transmission over the Internet, or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your Personal Data, we cannot
              guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;effective date&quot; at the top of this
              Privacy Policy.
            </p>
            <p className="mt-4">
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at privacy@ClaspCRM.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
