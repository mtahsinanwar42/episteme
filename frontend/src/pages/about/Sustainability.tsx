export default function Sustainability() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-teal-500 to-blue-400 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sustainability
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Building sustainable systems that support open science for
            generations to come.
          </p>
        </div>
      </div>

      {/* Principles Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Principles, Not Profits</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border-l-4 border-green-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Research Focused</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our priorities are based on the needs of scholars, librarians,
              funders, and institutional leaders.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border-l-4 border-teal-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-3">Cost Effective</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We will not waste public money and ensure our services deliver
              maximum value.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border-l-4 border-blue-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-3">Mission Driven</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Surplus revenue goes toward furthering our open science mission.
            </p>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="mb-20">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-8">
            Sustainable Business Model
          </h2>
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Equitable Pricing</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We prioritize equitable pricing that serves researchers
                  globally, ensuring access is not limited by geography or
                  resources.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="bg-teal-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Transparent Finances</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Transparent financial practices ensure accountability to our
                  community and stakeholders.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Long-term Vision</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Long-term sustainability ensures continued service to the
                  research community for years to come.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl font-bold mb-6">
            Our Commitment to the Future
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            We are committed to building sustainable systems that support open
            science for generations to come. Our goal is to ensure that
            knowledge remains freely accessible and that the research enterprise
            thrives, strengthened by equitable access and transparent practices.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl mb-2">♻️</div>
              <p className="font-semibold text-sm">Circular Impact</p>
            </div>
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <div className="text-3xl mb-2">🌐</div>
              <p className="font-semibold text-sm">Global Access</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl mb-2">📈</div>
              <p className="font-semibold text-sm">Growing Impact</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="text-3xl mb-2">🤝</div>
              <p className="font-semibold text-sm">Partnerships</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
