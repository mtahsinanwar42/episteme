export default function Executive() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Executive Officer",
      bio: "Visionary leader with 15+ years in open science and academic publishing",
      icon: "👩‍💼",
      expertise: ["Strategy", "Innovation", "Leadership"],
    },
    {
      name: "Prof. Michael Johnson",
      role: "Chief Research Officer",
      bio: "Pioneering researcher focused on open access and research integrity",
      icon: "👨‍🔬",
      expertise: ["Research", "Quality", "Standards"],
    },
    {
      name: "Dr. Elena Rodriguez",
      role: "Chief Technology Officer",
      bio: "Tech innovator leading our platform development and infrastructure",
      icon: "👩‍💻",
      expertise: ["Technology", "Architecture", "Security"],
    },
    {
      name: "James Wilson",
      role: "Chief Financial Officer",
      bio: "Finance expert ensuring sustainable growth and responsible stewardship",
      icon: "👨‍💼",
      expertise: ["Finance", "Operations", "Planning"],
    },
    {
      name: "Dr. Amelia Okafor",
      role: "Chief Diversity & Inclusion Officer",
      bio: "Advocate for equitable access and inclusive research communities",
      icon: "👩‍💼",
      expertise: ["Diversity", "Inclusion", "Community"],
    },
    {
      name: "David Kim",
      role: "Chief Strategy Officer",
      bio: "Strategic thinker driving partnerships and market expansion",
      icon: "👨‍💼",
      expertise: ["Strategy", "Partnerships", "Growth"],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-700 via-purple-600 to-slate-700 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Executive Leadership
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Meet the visionary leaders driving open science forward with
            innovation and purpose.
          </p>
        </div>
      </div>

      {/* Leadership Overview */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-8">Our Leadership Team</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-12">
          Our executive team brings together diverse expertise in research,
          technology, finance, and strategy. With decades of combined experience
          in academic publishing and open science, we're committed to
          transforming how knowledge is shared globally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-center">
                <div className="text-6xl mb-2">{member.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-purple-600 dark:text-purple-400 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Leadership Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Vision-Driven</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We are guided by a clear vision of open science and remain
              committed to long-term impact over short-term gains.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-3">Collaborative</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We listen, learn, and work together with our community to build
              solutions that serve everyone.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-2xl font-bold mb-3">Innovative</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We embrace new ideas, challenge the status quo, and continuously
              improve our approaches.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-3">Accountable</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We take responsibility for our decisions and are transparent about
              our progress and challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section>
        <h2 className="text-4xl font-bold mb-12">Organizational Structure</h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-2">👑</div>
              <p className="text-lg font-bold">Chief Executive Officer</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl mb-2">🔬</div>
                <p className="font-bold mb-4">Research & Quality</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CRO, Standards & Policies
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💻</div>
                <p className="font-bold mb-4">Technology & Innovation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CTO, Engineering & Product
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-bold mb-4">Operations & Growth</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CFO, Strategy & Finance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
