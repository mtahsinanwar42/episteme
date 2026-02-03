export default function Policies() {
  const policies = [
    {
      title: "Privacy Policy",
      icon: "🔐",
      description: "How we collect, use, and protect your personal information",
      lastUpdated: "January 2026",
      topics: ["Data Collection", "Data Protection", "User Rights", "Cookies"],
    },
    {
      title: "Terms of Service",
      icon: "⚖️",
      description: "Legal agreements governing the use of our platform",
      lastUpdated: "January 2026",
      topics: ["User Obligations", "License", "Limitations", "Disputes"],
    },
    {
      title: "Acceptable Use Policy",
      icon: "✅",
      description: "Guidelines for appropriate use of our services",
      lastUpdated: "January 2026",
      topics: [
        "Prohibited Activities",
        "Content Standards",
        "Enforcement",
        "Consequences",
      ],
    },
    {
      title: "Research Integrity Policy",
      icon: "🔬",
      description: "Standards and guidelines for ethical research practices",
      lastUpdated: "January 2026",
      topics: [
        "Authorship",
        "Data Management",
        "Conflicts of Interest",
        "Misconduct",
      ],
    },
    {
      title: "Open Access Policy",
      icon: "📖",
      description: "Our commitment to making research freely accessible",
      lastUpdated: "January 2026",
      topics: ["Access Rights", "License Types", "Preservation", "Reuse"],
    },
    {
      title: "Data & Security Policy",
      icon: "🛡️",
      description: "How we ensure platform security and data integrity",
      lastUpdated: "January 2026",
      topics: [
        "Security Measures",
        "Encryption",
        "Incident Response",
        "Compliance",
      ],
    },
    {
      title: "Accessibility Policy",
      icon: "♿",
      description: "Our commitment to making research accessible to everyone",
      lastUpdated: "January 2026",
      topics: [
        "WCAG Compliance",
        "Accessibility Features",
        "Support",
        "Feedback",
      ],
    },
    {
      title: "Copyright & Licensing",
      icon: "©️",
      description: "Information about intellectual property and licensing",
      lastUpdated: "January 2026",
      topics: [
        "Copyright Notice",
        "License Types",
        "Attribution",
        "Permissions",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Policies & Guidelines
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Comprehensive policies ensuring transparency, security, and ethical
            research practices.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Our Policy Framework</h2>
          <p className="text-lg text-foreground/80 leading-relaxed mb-6">
            We are committed to operating with transparency and integrity. Our
            comprehensive policies ensure that we protect user privacy, maintain
            research integrity, and provide a secure platform for open science.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="text-3xl shrink-0">📋</div>
              <div>
                <p className="font-bold mb-1">Clear Guidelines</p>
                <p className="text-sm text-foreground/70">
                  Easy-to-understand policies
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl shrink-0">🔄</div>
              <div>
                <p className="font-bold mb-1">Regular Updates</p>
                <p className="text-sm text-foreground/70">
                  Continuously improved policies
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl shrink-0">🤝</div>
              <div>
                <p className="font-bold mb-1">Community Input</p>
                <p className="text-sm text-foreground/70">
                  Feedback-driven approach
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Grid */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Policy Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {policy.title}
                    </h3>
                    <p className="text-indigo-100">{policy.description}</p>
                  </div>
                  <div className="text-4xl">{policy.icon}</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-foreground/80 mb-4">
                  Last updated: {policy.lastUpdated}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {policy.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full text-xs font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Read Policy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Principles */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Core Policy Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-green-500 shadow-md">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-3">User Protection</h3>
            <p className="text-foreground/80">
              We prioritize protecting user data and privacy through
              industry-standard security practices and transparent policies.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-blue-500 shadow-md">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-2xl font-bold mb-3">Research Integrity</h3>
            <p className="text-foreground/80">
              We maintain rigorous standards for research quality, ethics, and
              integrity across all content and operations.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-purple-500 shadow-md">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-2xl font-bold mb-3">Open Access</h3>
            <p className="text-foreground/80">
              We are committed to making research freely accessible and
              promoting open access principles globally.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-orange-500 shadow-md">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold mb-3">Fairness & Equity</h3>
            <p className="text-foreground/80">
              We ensure fair treatment and equitable access for all users,
              regardless of location or resources.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-4xl font-bold mb-12">Quick Access</h2>
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all border border-gray-700"
            >
              <div className="text-3xl mb-3">📄</div>
              <p className="font-bold mb-2">Full Policy Documents</p>
              <p className="text-sm text-gray-300">
                Access complete policy files
              </p>
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all border border-gray-700"
            >
              <div className="text-3xl mb-3">❓</div>
              <p className="font-bold mb-2">FAQ</p>
              <p className="text-sm text-gray-300">Common questions answered</p>
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all border border-gray-700"
            >
              <div className="text-3xl mb-3">💬</div>
              <p className="font-bold mb-2">Contact Us</p>
              <p className="text-sm text-gray-300">
                Questions about our policies?
              </p>
            </a>
            <a
              href="#"
              className="bg-slate-800 rounded-lg p-6 hover:shadow-lg transition-all border border-gray-700"
            >
              <div className="text-3xl mb-3">🔔</div>
              <p className="font-bold mb-2">Policy Updates</p>
              <p className="text-sm text-gray-300">
                Subscribe to change notifications
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
