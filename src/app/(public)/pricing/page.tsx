export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 10 users",
        "Basic contact management",
        "Project tracking",
        "Email support",
      ],
      cta: "Get started",
      featured: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "For growing businesses with more needs",
      features: [
        "Up to 50 users",
        "Advanced analytics",
        "HR management",
        "Priority support",
        "Inventory tracking",
      ],
      cta: "Most popular",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited users",
        "All modules included",
        "Dedicated account manager",
        "24/7 support",
        "Custom integrations",
        "On-premise option",
      ],
      cta: "Contact sales",
      featured: false,
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Choose the plan that works best for your business.
            </p>
          </div>

          <div className="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 border rounded-lg shadow-sm ${
                  plan.featured
                    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 bg-blue-600 text-white text-sm font-medium text-center py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {plan.description}
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                      {" "}
                      {plan.period}
                    </span>
                  )}
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-green-500 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                    plan.featured
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Compare plans
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Starter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    {
                      feature: "Users",
                      starter: "Up to 10",
                      pro: "Up to 50",
                      enterprise: "Unlimited",
                    },
                    {
                      feature: "Storage",
                      starter: "10GB",
                      pro: "50GB",
                      enterprise: "Unlimited",
                    },
                    {
                      feature: "Support",
                      starter: "Email",
                      pro: "Priority",
                      enterprise: "24/7",
                    },
                    {
                      feature: "Modules",
                      starter: "Basic",
                      pro: "Advanced",
                      enterprise: "All",
                    },
                    {
                      feature: "API Access",
                      starter: "No",
                      pro: "Yes",
                      enterprise: "Yes",
                    },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {row.starter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {row.pro}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
