import Image from "next/image";

export default function About() {
  return (
    <>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              About ClaspCRM
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Revolutionizing business management since 2023.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="relative bg-gray-50 dark:bg-gray-800 py-10 px-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Story
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Founded in 2023, ClaspCRM was born out of frustration with
                  existing business management solutions that were either too
                  simplistic or overly complex.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  We set out to create a platform that would give businesses
                  complete control over their operations without sacrificing
                  usability.
                </p>
              </div>

              <div className="relative bg-gray-50 dark:bg-gray-800 py-10 px-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To empower businesses of all sizes with tools that simplify
                  complex operations and drive growth.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe technology should work for you, not the other way
                  around.
                </p>
              </div>
            </div>

            <div className="mt-16 bg-gray-50 dark:bg-gray-800 py-10 px-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Our Team
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We&apos;re a diverse team of engineers, designers, and business
                experts passionate about building solutions that make a
                difference.
              </p>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Image
                      className="mx-auto rounded-full"
                      src={`https://picsum.photos/200/200?random=${i}`}
                      alt="Team member"
                      width={96}
                      height={96}
                    />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      Team Member {i + 1}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">Position</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
