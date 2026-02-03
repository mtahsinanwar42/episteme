export default function Career() {
  const positions = [
    {
      title: "Research Engineer",
      department: "Engineering",
      level: "Mid",
      icon: "🔧",
    },
    {
      title: "Content Strategist",
      department: "Content",
      level: "Senior",
      icon: "✍️",
    },
    {
      title: "Data Scientist",
      department: "Analytics",
      level: "Mid",
      icon: "📊",
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      level: "Mid",
      icon: "🎨",
    },
  ];

  const benefits = [
    {
      icon: "💰",
      title: "Competitive Salary",
      description: "Industry-competitive compensation packages",
    },
    {
      icon: "🏥",
      title: "Health Benefits",
      description: "Comprehensive health, dental, and vision coverage",
    },
    {
      icon: "🎓",
      title: "Learning & Development",
      description: "Continuous learning and professional growth opportunities",
    },
    {
      icon: "🏢",
      title: "Flexible Work",
      description: "Remote-first culture with flexible working arrangements",
    },
    {
      icon: "🌍",
      title: "Global Impact",
      description: "Make a difference in open science worldwide",
    },
    {
      icon: "🤝",
      title: "Great Team",
      description: "Work with passionate, collaborative colleagues",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Help us advance open science and make research accessible to
            everyone.
          </p>
        </div>
      </div>

      {/* Why Join Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-8">Why Join Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-lg text-foreground/80 leading-relaxed mb-4">
              We're building the future of open science. When you join our team,
              you're not just getting a job—you're becoming part of a mission to
              transform how research is shared and accessed globally.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed">
              We value innovation, collaboration, and impact. Every team member
              contributes to meaningful change in the research ecosystem.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-8 h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Shape the Future
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-foreground/80">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Open Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.map((position, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-all cursor-pointer hover:translate-y-[-4px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{position.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {position.department}
                  </p>
                </div>
                <div className="text-4xl">{position.icon}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                  {position.level}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-foreground/80 mb-4">
            More positions available on our careers page
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
            View All Positions
          </button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Apply now and help us advance open science. We review applications on
          a rolling basis and would love to hear from you!
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
          Apply Now
        </button>
      </section>
    </div>
  );
}
