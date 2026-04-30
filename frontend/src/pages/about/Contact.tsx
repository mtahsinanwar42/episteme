import { useState } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { contactService } from '@/services/contactService';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = EMAIL_REGEX.test(form.email);
  const isFormValid =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    isEmailValid &&
    form.subject.trim() !== '' &&
    form.message.trim() !== '';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError('');
    try {
      await contactService.sendContactSupport({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: "Contact" }]} />
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
        <div className="bg-slate-800 rounded-xl p-8 shadow-md border-t-4 border-teal-500 lg:col-start-2">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-xl font-bold mb-2">Support</h3>
          <p className="text-foreground/80 mb-4">Technical Support</p>
          <a
            href="mailto:epistemeone@gmail.com"
            className="text-teal-400 font-semibold hover:underline"
          >
            epistemeone@gmail.com
          </a>
        </div>
      </div>

      {/* Contact Form Section */}
      <section className="mb-20">
        <div className="relative bg-linear-to-br gradient-card rounded-2xl p-12">
          <LoadingOverlay visible={submitting} />
          <h2 className="text-4xl font-bold mb-4">Send us a Message</h2>
          <p className="text-foreground/80 mb-8">
            Fill out the form below and we'll get back to you as soon as
            possible.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-emerald-400">
              Your message has been sent successfully!
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled={submitting}
                />
                {form.email && !isEmailValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid email address.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject *
              </label>
              <Input
                id="subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
                placeholder="Tell us more..."
                disabled={submitting}
              ></textarea>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full text-foreground! shadow-lg enabled:hover:brightness-105"
              style={{
                background:
                  "linear-gradient(120deg, #646cff, #7f84ff 50%, #4f46e5)",
              }}
            >
              {submitting ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-12">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              How can I report an issue?
            </h3>
            <p className="text-foreground/80">
              Please contact our support team at epistemeone@gmail.com with
              details about the issue. We'll investigate and get back to you
              promptly.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              How long do responses take?
            </h3>
            <p className="text-foreground/80">
              We typically respond to inquiries within 24-48 business hours.
              Urgent support requests may be prioritized.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-3">
              Do you offer partnerships?
            </h3>
            <p className="text-foreground/80">
              Yes! We're always interested in strategic partnerships. Email
              epistemeone@gmail.com to discuss opportunities.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-3">Can I schedule a call?</h3>
            <p className="text-foreground/80">
              Absolutely! Mention your availability in the contact form and
              we'll arrange a time that works for both of us.
            </p>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-slate-800 rounded-2xl p-12 border border-gray-700">
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
              Our main office is located in Dhaka, Bangladesh.
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
