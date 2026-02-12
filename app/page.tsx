"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CalendarCheck,
  Ticket,
  ShieldCheck,
  Users,
  CreditCard,
  ScanLine,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
} from "lucide-react";
import "@/styles/globals.css";

export default function LandingLayout() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <>
      <Navbar/>
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white">
          {/* Animated background gradients */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-1/2 -left-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-orange-400/15 via-amber-500/10 to-transparent rounded-full blur-3xl"
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          <motion.div
            style={{ opacity, scale }}
            className="relative z-10 max-w-6xl mx-auto text-center px-6 py-20"
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300 tracking-wide">
                EVENT MANAGEMENT PLATFORM
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8"
              style={{ fontFamily: "'Cal Sans', sans-serif" }}
            >
              The End-to-End Platform for
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                  Creating and Attending Events
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute bottom-2 left-0 right-0 h-3 bg-orange-500/20 -z-0"
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
            >
              Evenza empowers organizers to host professional events and enables
              users to discover, book, and attend experiences seamlessly.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <a
                href="/events"
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Events
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href="/register"
                className="group px-8 py-4 rounded-full border-2 border-orange-500/50 text-orange-400 font-semibold hover:bg-orange-500/10 hover:border-orange-500 transition-all flex items-center gap-2"
              >
                Create an Event
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: "Events Hosted", value: "10K+" },
                { label: "Active Users", value: "50K+" },
                { label: "Tickets Sold", value: "500K+" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-orange-500/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-orange-500"
              />
            </motion.div>
          </motion.div>
        </section>
        {/* Features Section */}
        <section className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600 tracking-wide mb-8 mt-5">
                  POWERFUL FEATURES
                </span>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
              Everything You Need to{" "}
              <span className="text-orange-600">Run Events</span>
            </h2>
            <p className="text-lg text-gray-600 mt-5 leading-relaxed text-center">
              Evenza provides a complete ecosystem for organizers, attendees,
              and administrators to manage events professionally.
            </p>
          </motion.div>
        </section>

        <section className="py-32 bg-gradient-to-b from-white to-gray-50 relative">
          {/* Decorative line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<CalendarCheck className="w-6 h-6" />}
                title="Advanced Event Creation"
                description="Create detailed events with schedules, locations, capacity limits, and pricing models."
              />
              <FeatureCard
                icon={<Ticket className="w-6 h-6" />}
                title="Smart Ticketing"
                description="Reserve and sell tickets with real-time seat availability and automated limits."
              />
              <FeatureCard
                icon={<ScanLine className="w-6 h-6" />}
                title="Entry Validation"
                description="Secure ticket validation system to prevent duplicate or unauthorized entry."
              />
              <FeatureCard
                icon={<CreditCard className="w-6 h-6" />}
                title="Multiple Payment Options"
                description="Support for free events, paid tickets, Stripe, bank transfers, and local gateways."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Organizer & Attendee Roles"
                description="Clear role-based access for users, organizers, and platform administrators."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Admin Control Panel"
                description="Admins approve organizers, manage events, and control platform permissions."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Globe className="w-12 h-12 text-orange-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">
                Trusted by Event Organizers Worldwide
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join thousands of organizers using Evenza to create
                unforgettable experiences for their communities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] text-white overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-4xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Host or Attend Your
              <br />
              <span className="text-orange-400">Next Event?</span>
            </h2>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Join Evenza today and experience a smarter way to manage events.
              Get started in minutes.
            </p>

            <a
              href="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group relative rounded-3xl border border-gray-200 bg-white p-8 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-orange-50/0 group-hover:from-orange-50/50 group-hover:via-orange-50/20 group-hover:to-transparent transition-all duration-500" />

      <div className="relative">
        {/* Icon */}
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-orange-500/20">
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/0 to-orange-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}
