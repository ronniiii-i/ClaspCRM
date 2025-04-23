export default function Terms() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mt-20 prose prose-lg text-gray-500 dark:text-gray-300 mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              1. Terms
            </h2>
            <p>
              By accessing the ClaspCRM website and platform (the
              &quot;Service&quot;), you are agreeing to be bound by these Terms
              of Service, all applicable laws and regulations, and agree that
              you are responsible for compliance with any applicable local laws.
              If you do not agree with any of these terms, you are prohibited
              from using or accessing this site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on ClaspCRM&apos;s website for
              personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc pl-5">
              <li>modify or copy the materials;</li>
              <li>
                use the materials for any commercial purpose, or for any public
                display (commercial or non-commercial);
              </li>
              <li>
                attempt to decompile or reverse engineer any software contained
                on ClaspCRM&apos;s website;
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials; or
              </li>
              <li>
                transfer the materials to another person or &quot;mirror&quot;
                the materials on any other server.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              3. Disclaimer
            </h2>
            <p>
              The materials on ClaspCRM&apos;s website are provided on an
              &apos;as is&apos; basis. ClaspCRM makes no warranties, expressed
              or implied, and hereby disclaims and negates all other warranties
              including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              4. Limitations
            </h2>
            <p>
              In no event shall ClaspCRM or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on ClaspCRM&apos;s website, even
              if ClaspCRM or a ClaspCRM authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              5. Accuracy of Materials
            </h2>
            <p>
              The materials appearing on ClaspCRM&apos;s website could include
              technical, typographical, or photographic errors. ClaspCRM does
              not warrant that any of the materials on its website are accurate,
              complete or current. ClaspCRM may make changes to the materials
              contained on its website at any time without notice. However
              ClaspCRM does not make any commitment to update the materials.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              6. Modifications
            </h2>
            <p>
              ClaspCRM may revise these Terms of Service for its website at any
              time without notice. By using this website you are agreeing to be
              bound by the then current version of these Terms of Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8">
              7. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of the State of Delaware and you
              irrevocably submit to the exclusive jurisdiction of the courts in
              that State or location.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
