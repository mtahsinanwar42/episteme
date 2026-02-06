import { Breadcrumb } from "@/components/common/Breadcrumb";

export default function Ethics() {
  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: "Ethics & Integrity" }]} />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ethics & Integrity
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Committed to the highest standards of research ethics, transparency,
            and fairness.
          </p>
        </div>
      </div>

      {/* Foundation Section */}
      <section className="mb-20">
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6">Our Ethical Foundation</h2>
          <p className="text-xl text-foreground/80 leading-relaxed mb-6">
            We are committed to the highest standards of research ethics and
            integrity. Our platform is built on principles of transparency,
            accountability, and fairness that guide every decision we make.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-indigo-400">
                ✓ Principled Approach
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Everything we do is guided by clear ethical principles
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-purple-400">
                ✓ Researcher Focused
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Our decisions prioritize the needs of the research community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Core Ethical Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-indigo-500">
            <div className="text-5xl mb-4">🔓</div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-400">
              Openness & Transparency
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              We believe in transparent processes and openly share our
              methodologies, data, and decision-making frameworks with the
              research community.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-purple-500">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-4 text-purple-400">
              Equity & Inclusion
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              We actively work to remove barriers and ensure that all
              researchers, regardless of geography or resources, can fully
              participate.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-pink-500">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold mb-4 text-pink-400">
              Research Integrity
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              We maintain rigorous standards for research quality and support
              mechanisms that promote responsible and ethical research
              practices.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-rose-500">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-4 text-rose-400">
              Accountability
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              We hold ourselves accountable to the research community and
              continuously work to improve our processes and policies.
            </p>
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-12 text-foreground">
          <h2 className="text-4xl font-bold mb-8">Commitment to Excellence</h2>
          <p className="text-xl leading-relaxed mb-8">
            We are dedicated to supporting ethical research practices and
            fostering a research environment where integrity, transparency, and
            accountability are paramount. Our commitment extends across every
            aspect of our operations and every interaction with the research
            community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-3">🎓</div>
              <p className="font-semibold mb-2">Education</p>
              <p className="text-foreground/80 text-sm">
                Supporting ethical research education and training
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold mb-2">Oversight</p>
              <p className="text-foreground/80 text-sm">
                Continuous monitoring and improvement of practices
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-3">🌟</div>
              <p className="font-semibold mb-2">Excellence</p>
              <p className="text-foreground/80 text-sm">
                Setting and maintaining the highest standards
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
