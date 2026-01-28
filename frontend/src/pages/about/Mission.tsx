export default function Mission() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Mission & Vision
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Advancing open science with measurable, meaningful change in
            research publishing, policy, and practice.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              We are on a mission to advance open science forward with
              measurable, meaningful change in research publishing, policy, and
              practice.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Building on a commitment to innovation, we continue to reimagine
              models to meet open science principles, removing barriers and
              promoting inclusion in knowledge creation and sharing.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Open Science Forward
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-4">Our Vision</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 font-semibold">
          We believe in a better future where science is open to all, for all
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400">
              Open Knowledge Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Researchers openly share all important research outputs and
              receive recognition for the value of their contributions to
              science and society.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-pink-200 dark:border-pink-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3 text-pink-600 dark:text-pink-400">
              Accelerated Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Knowledge creation is faster and more efficient as outputs are
              shared and reusable, enabling scrutiny, corrections, and
              collaboration.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-3 text-orange-600 dark:text-orange-400">
              Diverse Perspectives
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Diverse perspectives help make research questions relevant and
              results trustworthy to diverse communities and society as a whole.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-red-200 dark:border-red-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3 text-red-600 dark:text-red-400">
              Equitable Access
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Equitable, sustainable models ensure fair participation and access
              for both producers and consumers of research.
            </p>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-12">
        <h2 className="text-4xl font-bold mb-8">Our Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="text-3xl flex-shrink-0">✅</div>
            <div>
              <p className="font-semibold text-lg mb-2">
                Accelerate Innovation
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Acting in partnership with others to advance open science
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl flex-shrink-0">✅</div>
            <div>
              <p className="font-semibold text-lg mb-2">Distinctive Value</p>
              <p className="text-gray-600 dark:text-gray-300">
                Openness throughout the research cycle for researchers
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl flex-shrink-0">✅</div>
            <div>
              <p className="font-semibold text-lg mb-2">Increase Resources</p>
              <p className="text-gray-600 dark:text-gray-300">
                Steadily grow capabilities dedicated to our vision
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl flex-shrink-0">✅</div>
            <div>
              <p className="font-semibold text-lg mb-2">Serve Researchers</p>
              <p className="text-gray-600 dark:text-gray-300">
                Prioritize needs of scholars, librarians, and funders
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
