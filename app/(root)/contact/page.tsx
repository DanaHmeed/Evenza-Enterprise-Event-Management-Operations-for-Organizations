// app/(root)/contact/page.tsx
"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate send — replace with actual API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setSubmitting(false);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <section className="bg-white">
      {/* Hero */}
      <div className="relative py-20 bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-4">
                {[
                  {
                    icon: <Mail className="w-5 h-5" />,
                    label: "Email",
                    value: "support@evenza.com",
                    href: "mailto:support@evenza.com",
                  },
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    label: "Location",
                    value: "Nablus, Palestine",
                    href: null,
                  },
                  {
                    icon: <Globe className="w-5 h-5" />,
                    label: "Website",
                    value: "www.evenza.com",
                    href: "/",
                  },
                ].map((info, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Office hours */}
              <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <p className="text-sm font-semibold text-orange-800 mb-1">
                  Response Time
                </p>
                <p className="text-xs text-orange-700">
                  We typically respond within 24 hours during business days
                  (Sun–Thu, 9AM–5PM Palestine Time).
                </p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-orange-600 font-semibold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Send a Message</h2>
                      <p className="text-sm text-gray-500">Fill out the form and we&apos;ll be in touch.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="How can we help?"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us more about your question or request..."
                        rows={6}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}