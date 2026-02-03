import { Link } from "react-router-dom";

export default function HomeMission() {
  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h2>
        <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
          Advancing open science with measurable, meaningful change
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <p className="text-lg text-foreground/80 mb-4 leading-relaxed">
            We are on a mission to advance open science forward with measurable,
            meaningful change in research publishing, policy, and practice.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            Building on a commitment to innovation, we continue to reimagine
            models to meet open science principles, removing barriers and
            promoting inclusion in knowledge creation and sharing.
          </p>
          <Link
            to="/about/mission"
            className="inline-block mt-6 text-purple-400 font-semibold hover:underline"
          >
            Learn more about our mission →
          </Link>
        </div>
        <div className="gradient-card rounded-xl p-8 h-80 flex items-center justify-center border border-gray-700">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-2xl font-bold">Open Science Forward</p>
          </div>
        </div>
      </div>

      {/* Vision Cards */}
      <div>
        <h3 className="text-3xl font-bold mb-8 text-center">Our Vision</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="gradient-card rounded-xl p-6 border-2 border-purple-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-lg font-bold mb-2">Open Knowledge</h4>
            <p className="text-foreground/80 text-sm">
              Researchers openly share outputs and receive recognition.
            </p>
          </div>

          <div className="gradient-card rounded-xl p-6 border-2 border-pink-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-bold mb-2">Accelerated Progress</h4>
            <p className="text-foreground/80 text-sm">
              Faster knowledge creation through shared, reusable outputs.
            </p>
          </div>

          <div className="gradient-card rounded-xl p-6 border-2 border-orange-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="text-lg font-bold mb-2">Diverse Perspectives</h4>
            <p className="text-foreground/80 text-sm">
              Making research relevant and trustworthy to all communities.
            </p>
          </div>

          <div className="gradient-card rounded-xl p-6 border-2 border-red-700 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h4 className="text-lg font-bold mb-2">Equitable Access</h4>
            <p className="text-foreground/80 text-sm">
              Fair participation and access for all researchers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
