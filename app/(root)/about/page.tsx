// app/(root)/about/page.tsx
"use client";

import {
  Globe,
  Users,
  Ticket,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

export default function AboutPage() {
  return (
    <section className="bg-white">
      {/* Hero */}
      <div className="relative py-24 bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">ABOUT EVENZA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The Story Behind{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Evenza
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Evenza is a full-stack event management platform built as a graduation
              project — designed to connect organizers with attendees through
              a seamless, modern experience.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-8">
            We believe that great events bring people together. Whether it&apos;s a
            university conference, a startup meetup, a community workshop, or an
            online webinar — the experience of discovering, registering, and
            attending should be effortless.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            Evenza was built to make that happen. We provide organizers with the tools
            to create professional events, manage attendees, and track analytics —
            while giving attendees a smooth way to discover events, purchase tickets,
            and check in with a QR code.
          </p>
        </motion.div>
      </div>

      {/* Values */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              The principles that guide how we build Evenza.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Accessibility",
                desc: "Anyone should be able to create or attend events regardless of technical skill. Our platform works for universities, startups, and individual organizers alike.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Security & Trust",
                desc: "Payments processed through Stripe with SSL encryption. QR tickets with unique codes. Admin moderation to keep the platform safe.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Community First",
                desc: "Built for the Palestinian community and beyond. We focus on the needs of local organizers while building a platform that scales globally.",
              },
              {
                icon: <CalendarCheck className="w-6 h-6" />,
                title: "Complete Solution",
                desc: "From event creation to check-in to post-event feedback — Evenza handles the entire event lifecycle in one platform.",
              },
              {
                icon: <Ticket className="w-6 h-6" />,
                title: "Modern Experience",
                desc: "QR code tickets, real-time updates, responsive design, and smooth animations. We use the latest web technologies for the best user experience.",
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: "Made with Passion",
                desc: "Every feature was designed and coded with care. This isn't just a project — it's a platform we're proud of.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-20 max-w-4xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built With</h2>
          <p className="text-gray-600 mb-8">
            Evenza uses modern, battle-tested technologies to deliver a fast and reliable experience.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "Next.js 15",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "Prisma ORM",
              "PostgreSQL",
              "Clerk Auth",
              "Stripe Payments",
              "Framer Motion",
              "Lucide Icons",
              "Zod Validation",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-orange-100 max-w-xl mx-auto mb-8">
            Whether you&apos;re looking to attend events or organize your own,
            Evenza has you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="px-8 py-4 rounded-full bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              Browse Events
            </Link>
            <Link
              href="/sign-up"
              className="px-8 py-4 rounded-full border-2 border-white/50 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}