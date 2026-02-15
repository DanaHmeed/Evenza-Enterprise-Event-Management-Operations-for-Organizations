// app/page.tsx
// Evenza Landing Page — Comprehensive graduation-level homepage
"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
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
  BarChart3,
  Bell,
  Star,
  CheckCircle2,
  Zap,
  Lock,
  Headphones,
  ChevronRight,
  Quote,
  MapPin,
  Clock,
  Search,
  Filter,
  Layers,
  MessageSquare,
  Eye,
} from "lucide-react";

// ─── Reusable Animation Variants ───
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <LogoCloudSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PlatformShowcaseSection />
        <EventTypesSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingPreviewSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

// ════════════════════════════════════════════════════════════
// 1. HERO SECTION
// ════════════════════════════════════════════════════════════
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white overflow-hidden"
    >
      {/* Animated blobs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/4 w-[900px] h-[900px] bg-gradient-to-tr from-orange-400/15 via-amber-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-rose-500/5 to-orange-500/10 rounded-full blur-3xl"
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-6xl mx-auto text-center px-6 pt-32 pb-20"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-300 tracking-wide">
            THE ALL-IN-ONE EVENT PLATFORM
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold leading-[1.08] mb-8 tracking-tight"
        >
          Create, Manage &amp; Attend
          <br />
          <span className="relative inline-block mt-2">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Extraordinary Events
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-2 left-0 right-0 h-3 bg-orange-500/20 origin-left"
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
          From discovery to check-in, Evenza powers the entire event lifecycle.
          Organizers create and sell. Attendees discover and engage.
          Administrators oversee and optimize.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/events"
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/sign-up"
            className="group px-8 py-4 rounded-full border-2 border-orange-500/50 text-orange-400 font-semibold hover:bg-orange-500/10 hover:border-orange-500 transition-all flex items-center gap-2"
          >
            Start Organizing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: "Events Hosted", value: "10K+" },
            { label: "Active Users", value: "50K+" },
            { label: "Tickets Issued", value: "500K+" },
            { label: "Countries", value: "45+" },
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
  );
}

// ════════════════════════════════════════════════════════════
// 2. LOGO CLOUD
// ════════════════════════════════════════════════════════════
function LogoCloudSection() {
  const orgs = [
    "An-Najah University",
    "Birzeit University",
    "Palestine Polytechnic",
    "Arab American University",
    "TechStart Palestine",
    "Gaza Sky Geeks",
    "PALTEL Group",
    "Bank of Palestine",
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase mb-10">
          Trusted by leading organizations
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {orgs.map((org, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-gray-400 font-semibold text-sm hover:text-orange-500 transition-colors cursor-default"
            >
              {org}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 3. FEATURES — 12 Cards
// ════════════════════════════════════════════════════════════
function FeaturesSection() {
  const features = [
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Advanced Event Creation",
      desc: "Rich descriptions, media uploads, draft/publish workflow, categories, tags, and SEO-friendly slugs.",
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      title: "Smart Ticketing & QR Codes",
      desc: "Auto-generated QR tickets on registration. Unique codes per attendee for secure, paperless entry.",
    },
    {
      icon: <ScanLine className="w-6 h-6" />,
      title: "Live Check-In Scanner",
      desc: "Organizers scan QR codes at the door. Real-time check-in tracking with duplicate detection.",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Flexible Payments",
      desc: "Stripe for card payments. Bank transfers, cash, and JawwalPay for local markets. Free events too.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Role-Based Access Control",
      desc: "Three roles: Attendees discover & register, Organizers manage events, Admins oversee the platform.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Admin Control Center",
      desc: "Moderate events & feedback, manage users & roles, view audit logs, and edit platform settings.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Analytics",
      desc: "Track registrations, revenue, check-in rates, and feedback scores on live dashboards.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "In-App Notifications",
      desc: "12 notification types: registration confirmations, approvals, event updates, waitlist alerts, and more.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Feedback & Reviews",
      desc: "Post-event ratings with title, comment, and stars. Admin moderation before public display.",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Discovery & Filters",
      desc: "Search by keyword. Filter by category, date, price, location, event type. Pagination built-in.",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Online & In-Person Events",
      desc: "Physical venues with addresses, maps, and coordinates. Virtual events with meeting link integration.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Waitlist Management",
      desc: "Automatic waitlist when events fill up. Attendees get notified instantly when spots open.",
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-white to-gray-50 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600 tracking-wide">
              POWERFUL FEATURES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Everything You Need to{" "}
            <span className="text-orange-600">Run Events</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A complete ecosystem for organizers, attendees, and administrators —
            from creation to check-in to analytics.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {features.map((f, i) => (
            <motion.div key={i} custom={i}>
              <FeatureCard icon={f.icon} title={f.title} description={f.desc} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-7 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 h-full">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/0 to-orange-50/0 group-hover:from-orange-50/50 group-hover:to-transparent transition-all duration-500" />
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/20">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 4. HOW IT WORKS
// ════════════════════════════════════════════════════════════
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Create Your Account",
      desc: "Sign up in seconds with email or Google. Choose to discover events or start organizing them.",
      icon: <Users className="w-7 h-7" />,
    },
    {
      step: "02",
      title: "Discover or Create Events",
      desc: "Browse by category, date, or location. Organizers create rich event pages with pricing and media.",
      icon: <Search className="w-7 h-7" />,
    },
    {
      step: "03",
      title: "Register & Get Your Ticket",
      desc: "One-click registration for free events. Secure Stripe checkout for paid events. Instant QR ticket.",
      icon: <Ticket className="w-7 h-7" />,
    },
    {
      step: "04",
      title: "Attend & Check In",
      desc: "Show your QR code at the door. Organizer scans it for instant validation. You're in!",
      icon: <ScanLine className="w-7 h-7" />,
    },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600 tracking-wide">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Get Started in{" "}
            <span className="text-orange-600">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re attending or organizing, Evenza makes it
            seamless from start to finish.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="relative text-center"
            >
              <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 ring-4 ring-white">
                {s.icon}
              </div>
              <div className="text-xs font-bold text-orange-500 mb-2 tracking-widest">
                STEP {s.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {s.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 5. PLATFORM SHOWCASE — Role-based tabs
// ════════════════════════════════════════════════════════════
function PlatformShowcaseSection() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "For Attendees",
      icon: <Users className="w-5 h-5" />,
      title: "Discover & Attend Events Seamlessly",
      color: "from-blue-500 to-blue-600",
      features: [
        "Browse events with powerful search and smart filters",
        "Register for free events or purchase tickets via Stripe",
        "Receive QR code tickets instantly in your account",
        "View upcoming events and past attendance history",
        "Submit star ratings and reviews after attending",
        "Join waitlists and get notified when spots open",
      ],
    },
    {
      label: "For Organizers",
      icon: <CalendarCheck className="w-5 h-5" />,
      title: "Create & Manage Professional Events",
      color: "from-orange-500 to-orange-600",
      features: [
        "Rich event editor with media uploads and categories",
        "Set pricing, capacity limits, and registration deadlines",
        "Draft → Publish workflow with preview before going live",
        "Real-time attendee list with check-in status tracking",
        "Scan QR tickets at the door with built-in validator",
        "Revenue tracking, feedback analysis, and analytics",
      ],
    },
    {
      label: "For Admins",
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Oversee & Optimize the Entire Platform",
      color: "from-purple-500 to-purple-600",
      features: [
        "Platform-wide dashboard with key performance metrics",
        "Approve, flag, or unpublish events and user content",
        "Manage user accounts, roles, and access permissions",
        "Moderate feedback and reviews before they go public",
        "Full audit log of all administrative actions",
        "Edit platform settings, terms, and contact info",
      ],
    },
  ];

  const active = tabs[activeTab];

  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Globe className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600 tracking-wide">
              THE PLATFORM
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Built for <span className="text-orange-600">Every Role</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three distinct experiences tailored to each user type. One powerful
            platform.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === i
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-gray-200 p-10 md:p-14 shadow-sm"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {active.title}
              </h3>
              <ul className="space-y-4">
                {active.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual mockup placeholder */}
            <div
              className={`bg-gradient-to-br ${active.color} rounded-2xl p-10 flex flex-col items-center justify-center min-h-[380px] text-white relative overflow-hidden`}
            >
              {/* Decorative pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  {tabs[activeTab].icon}
                </div>
                <p className="font-bold text-xl mb-1">{tabs[activeTab].label}</p>
                <p className="text-white/70 text-sm">Dashboard Preview</p>

                {/* Mock UI elements */}
                <div className="mt-6 space-y-2 max-w-[200px] mx-auto">
                  <div className="h-3 bg-white/20 rounded-full" />
                  <div className="h-3 bg-white/15 rounded-full w-4/5" />
                  <div className="h-3 bg-white/10 rounded-full w-3/5" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-16 bg-white/10 rounded-lg" />
                    <div className="h-16 bg-white/15 rounded-lg" />
                    <div className="h-16 bg-white/10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 6. EVENT TYPES — Showcasing versatility
// ════════════════════════════════════════════════════════════
function EventTypesSection() {
  const types = [
    {
      title: "Conferences & Summits",
      desc: "Multi-day professional events with speaker management and session scheduling.",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Workshops & Training",
      desc: "Hands-on learning events with limited capacity and approval-based registration.",
      icon: <Users className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Networking & Meetups",
      desc: "Casual community gatherings with free or paid entry and check-in tracking.",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      title: "Webinars & Virtual Events",
      desc: "Online events with meeting link integration. No venue needed, global reach.",
      icon: <Globe className="w-6 h-6" />,
      color: "bg-orange-500",
    },
    {
      title: "Fundraisers & Galas",
      desc: "Paid events with ticket management, revenue tracking, and receipt generation.",
      icon: <CreditCard className="w-6 h-6" />,
      color: "bg-rose-500",
    },
    {
      title: "University & Campus Events",
      desc: "Student-run events with admin oversight, waitlists, and feedback collection.",
      icon: <Eye className="w-6 h-6" />,
      color: "bg-amber-500",
    },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Filter className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600 tracking-wide">
              EVENT TYPES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            One Platform,{" "}
            <span className="text-orange-600">Endless Possibilities</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From intimate workshops to large-scale conferences, Evenza adapts to
            any event format.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {types.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              className="group p-7 rounded-2xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 ${t.color} rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}
              >
                {t.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 7. STATS — Trust bar
// ════════════════════════════════════════════════════════════
function StatsSection() {
  const stats = [
    {
      value: "99.9%",
      label: "Uptime Reliability",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      value: "<2s",
      label: "Average Load Time",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      value: "256-bit",
      label: "SSL Encryption",
      icon: <Lock className="w-6 h-6" />,
    },
    {
      value: "24/7",
      label: "Platform Monitoring",
      icon: <Headphones className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-20 bg-[#0a0e1a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                {s.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {s.value}
              </div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 8. TESTIMONIALS
// ════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Evenza transformed how we manage university conferences. The QR check-in alone saved hours of manual work.",
      name: "Dr. Ahmad Khalil",
      role: "Conference Chair, An-Najah University",
      rating: 5,
    },
    {
      quote:
        "As a student organizer, I published my first event in under 10 minutes. The platform is incredibly intuitive and professional.",
      name: "Sara Nasser",
      role: "Student Event Organizer",
      rating: 5,
    },
    {
      quote:
        "The admin dashboard gives me complete visibility. I can moderate content, manage users, and track growth in real time.",
      name: "Omar Habash",
      role: "Platform Administrator",
      rating: 5,
    },
    {
      quote:
        "The payment system is seamless. Stripe integration works perfectly, and having local payment options like bank transfer is a huge plus.",
      name: "Layla Barakat",
      role: "Event Coordinator, TechStart",
      rating: 5,
    },
    {
      quote:
        "Registering for events is so smooth. I get my QR ticket instantly and the waitlist feature notified me the moment a spot opened.",
      name: "Yousef Mansour",
      role: "Regular Attendee",
      rating: 5,
    },
    {
      quote:
        "We moved from spreadsheets to Evenza and never looked back. The analytics and attendee management features are exactly what we needed.",
      name: "Rania Khouri",
      role: "HR & Events, PALTEL Group",
      rating: 5,
    },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
            <Quote className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600 tracking-wide">
              TESTIMONIALS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Loved by{" "}
            <span className="text-orange-600">Organizers &amp; Attendees</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our community says about their Evenza experience.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900 text-sm">
                  {t.name}
                </div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 9. PRICING PREVIEW
// ════════════════════════════════════════════════════════════
function PricingPreviewSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "For attendees",
      features: [
        "Browse all events",
        "Register for free events",
        "QR code tickets",
        "Submit feedback & reviews",
        "In-app notifications",
      ],
      cta: "Sign Up Free",
      highlighted: false,
    },
    {
      name: "Organizer",
      price: "$0",
      period: "while in beta",
      desc: "For event creators",
      features: [
        "Create unlimited events",
        "Sell paid tickets via Stripe",
        "Attendee management tools",
        "QR check-in scanner",
        "Analytics dashboard",
        "Waitlist management",
      ],
      cta: "Start Organizing",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For large organizations",
      features: [
        "Everything in Organizer",
        "Custom branding & themes",
        "Priority support",
        "API access",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      cta: "Contact Us",
      highlighted: false,
    },
  ];

  return (
    <section className="py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Simple,{" "}
            <span className="text-orange-600">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Free for attendees. Affordable for organizers. No hidden fees ever.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={`rounded-2xl p-8 border relative ${
                plan.highlighted
                  ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white border-orange-500 shadow-xl shadow-orange-500/20 md:scale-105 md:-my-4"
                  : "bg-white text-gray-900 border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full tracking-wider">
                  MOST POPULAR
                </div>
              )}

              <div className="text-sm font-semibold mb-1 opacity-80 uppercase tracking-wider">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span
                    className={`text-sm ${plan.highlighted ? "text-orange-100" : "text-gray-500"}`}
                  >
                    /{plan.period}
                  </span>
                )}
              </div>
              <p
                className={`text-sm mb-6 ${plan.highlighted ? "text-orange-100" : "text-gray-500"}`}
              >
                {plan.desc}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-orange-200" : "text-orange-500"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/sign-up"}
                className={`block text-center py-3 rounded-full font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 10. FAQ
// ════════════════════════════════════════════════════════════
function FAQSection() {
  const faqs = [
    {
      q: "Is Evenza free to use?",
      a: "Yes! Attendees can browse, register, and attend events completely free. Organizers can also create events for free during our beta period. We plan to introduce affordable organizer plans in the future.",
    },
    {
      q: "How do QR code tickets work?",
      a: "When you register for an event (free or paid), a unique QR code ticket is automatically generated and saved to your account. At the event venue, the organizer scans your QR code using the built-in scanner to validate your entry. Each code can only be used once.",
    },
    {
      q: "Can I create both free and paid events?",
      a: "Absolutely. Organizers can create free events where registration is instant, or paid events with Stripe checkout for card payments. We also support bank transfers, cash payments, and local gateways like JawwalPay.",
    },
    {
      q: "What happens if an event is full?",
      a: "If the organizer enables the waitlist feature, you can join the waiting queue. When a spot opens up due to a cancellation, the next person in line is automatically notified and gets the opportunity to register.",
    },
    {
      q: "How does the feedback system work?",
      a: "After an event ends, attendees can leave a star rating (1-5) and a written review. All feedback goes through admin moderation before being displayed publicly on the event page. This ensures quality and prevents spam.",
    },
    {
      q: "Is my payment information secure?",
      a: "Yes. All payments are processed through Stripe with industry-standard PCI DSS compliance and 256-bit SSL encryption. We never store your card details on our servers. Stripe handles all sensitive payment data.",
    },
    {
      q: "Can I cancel my registration?",
      a: "Yes, you can cancel your registration at any time before the event starts. For free events, the cancellation is instant. For paid events, refund policies are set by the event organizer.",
    },
    {
      q: "What kind of events can I create?",
      a: "Any kind! Conferences, workshops, webinars, meetups, fundraisers, university events, corporate training, networking sessions — both online and in-person. The platform adapts to your event type.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-28 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Frequently Asked{" "}
            <span className="text-orange-600">Questions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.5}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full flex items-center justify-between p-5 rounded-xl border text-left transition-all ${
                  openIndex === i
                    ? "bg-orange-50 border-orange-200 shadow-sm"
                    : "bg-gray-50 border-gray-100 hover:bg-orange-50/50 hover:border-orange-100"
                }`}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.q}
                </span>
                <ChevronRight
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i
                      ? "rotate-90 text-orange-500"
                      : "text-gray-400"
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === i ? "auto" : 0,
                  opacity: openIndex === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 pt-3">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 11. FINAL CTA
// ════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 text-center max-w-4xl mx-auto px-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-300 tracking-wide">
            JOIN EVENZA TODAY
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Ready to Create Your
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Next Great Event?
          </span>
        </h2>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          Whether you&apos;re hosting or attending, your next unforgettable
          experience starts here. Get started in minutes — completely free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-white/40 transition-all"
          >
            Browse Events
          </Link>
        </div>

        {/* Mini trust bar */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            Free to start
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            Setup in under 5 minutes
          </span>
        </div>
      </motion.div>
    </section>
  );
}