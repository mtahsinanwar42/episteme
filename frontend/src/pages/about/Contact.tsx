export default function Contact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 py-20 px-4 rounded-lg mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Have questions? We'd love to hear from you. Reach out to our team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* Contact Info Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md border-t-4 border-emerald-500">
          <div className="text-5xl mb-4">📧</div>
          <h3 className="text-xl font-bold mb-2">Email</h3>
          <p className="text-foreground/80 mb-4">For general inquiries</p>
          <a
            href="mailto:info@episteme.org"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            info@episteme.org
          </a>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md border-t-4 border-teal-500">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-xl font-bold mb-2">Partnerships</h3>
          <p className="text-foreground/80 mb-4">Business inquiries</p>
          <a
            href="mailto:partnerships@episteme.org"
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            partnerships@episteme.org
          </a>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md border-t-4 border-cyan-500">
          <div className="text-5xl mb-4">📞</div>
          <h3 className="text-xl font-bold mb-2">Support</h3>
          <p className="text-foreground/80 mb-4">Technical support</p>
          <a
            href="mailto:support@episteme.org"
            className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
          >
            support@episteme.org
          </a>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="mb-20">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Send us a Message</h2>
          <p className="text-foreground/80 mb-8">
            Fill out the form below and we'll get back to you as soon as
            possible.
          </p>

          <form className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell us more..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              How can I report an issue?
            </h3>
            <p className="text-foreground/80">
              Please contact our support team at support@episteme.org with
              details about the issue. We'll investigate and get back to you
              promptly.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              How long do responses take?
            </h3>
            <p className="text-foreground/80">
              We typically respond to inquiries within 24-48 business hours.
              Urgent support requests may be prioritized.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              Do you offer partnerships?
            </h3>
            <p className="text-foreground/80">
              Yes! We're always interested in strategic partnerships. Email
              partnerships@episteme.org to discuss opportunities.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-3">Can I schedule a call?</h3>
            <p className="text-foreground/80">
              Absolutely! Mention your availability in the contact form and
              we'll arrange a time that works for both of us.
            </p>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
        <h2 className="text-4xl font-bold mb-12">Our Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🌎</div>
            <h3 className="text-xl font-bold mb-2">Global Presence</h3>
            <p className="text-foreground/80">
              We operate globally with a distributed team across multiple
              continents.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-xl font-bold mb-2">Headquarters</h3>
            <p className="text-foreground/80">
              Our main office is located in San Francisco, California.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h3 className="text-xl font-bold mb-2">Remote Team</h3>
            <p className="text-foreground/80">
              Most of our team works remotely, collaborating across time zones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
