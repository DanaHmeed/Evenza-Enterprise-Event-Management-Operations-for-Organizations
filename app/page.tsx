// app/page.tsx
// Evenza Landing Page — Comprehensive graduation-level homepage
"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import Image from "next/image";
import { Link2, Video } from "lucide-react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  CalendarCheck,
  Ticket,
  ShieldCheck,
  Users,
  CreditCard,
  ScanLine,
  ArrowRight,
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
import { styleText } from "node:util";

// Stagger container variants for feature cards
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
      <main className="bg-gradient-to-r from-[#fbfaf8] to-[#fffffe]">
        {" "}
        <HeroSection />
        <div className="flex flex-col gap-20">
          <FeaturesShowcase />
          <IntelligentWorkflow />
          <HowItWorksSection />
          <PlatformShowcaseSection />
          <EventTypesSection />
          <StatsSection />
          <TestimonialsSection />
          <PricingPreviewSection />
          <FAQSection />
          <CTASection />
          <Footer />
        </div>
      </main>
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
      className="relative min-h-screen flex items-center justify-center bg-[#020617] text-white overflow-hidden py-20"
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
        className="relative z-10 max-w-6xl mx-auto text-center px-6"
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl text-white md:text-6xl font-bold  leading-[1.08] mb-8 tracking-tight"
        >
          WHERE EVERY EVENT FINDS IT’S AUDIENCE. <br />
          <span className="relative inline-block mt-2 mb-20">
            <span className="text-[27px] bg-gradient-to-r from-orange-400 via-white to-white bg-clip-text text-transparent font-[Quicksand]">
              Create. Host. Experience. All in one place.
            </span>
            {/* Subtitle */}
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl text-center mx-auto mb-20 font-[Quicksand]">
              Plan, launch, and scale events with precision. Evenza gives
              organizers complete control and gives audiences seamless access to
              experiences that matter. Built to support growth, engagement, and
              impact at every stage.
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-2 left-0 right-0 h-3"
            />
          </span>
        </motion.h1>

        {/* CTA */}
        <Link href="/events" className="mb-[48px] inline-block">
          <button className="explore-button mb-48px font-[Quicksand]">
            <span className="explore-button__icon-wrapper">
              <svg
                viewBox="0 0 14 15"
                width="10"
                fill="currentColor"
                className="explore-button__icon-svg"
              >
                <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" />
              </svg>

              <svg
                viewBox="0 0 14 15"
                width="10"
                fill="currentColor"
                className="explore-button__icon-svg explore-button__icon-svg--copy"
              >
                <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" />
              </svg>
            </span>
            Explore Evenza
          </button>
        </Link>

        {/* Hero Stats */}
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
// 2. FEATURES SHOWCASE

const features = [
  {
    title: "IN PERSON EVENTS",
    description:
      "Host unforgettable on-site experiences with rich event pages with media, categories, and SEO-friendly slugs.",
    glow: "rgba(249,115,22,0.15)",
    bg: "/images/card1.png",
    icon: <Users size={26} strokeWidth={2} />,
  },
  {
    title: "VIRTUAL EVENTS",
    description:
      "Host online events with meeting link integration. Attendees receive instant QR code tickets for seamless access.",
    glow: "rgba(249,115,22,0.15)",
    bg: "/images/card2.png",
    icon: <Video size={26} strokeWidth={2} />,    
  },
  {
    title: "HYBRID EVENTS",
    description:
      "Combine physical and virtual elements. Manage registrations, ticketing, and check-ins for both audiences in one place.",
    glow: "rgba(249,115,22,0.15)",
    bg: "/images/card3.png",
    icon: <Link2 size={26} strokeWidth={2} />,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 2,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesShowcase() {
  return (
    <section className="relative bg-[#0a0a0f] overflow-hidden min-h-[100svh] flex items-center justify-center">
      {/* Top gradient border */}
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full flex flex-col items-center justify-center gap-16 px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase mb-4">
            PLATFORM FEATURES
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight font-quicksand">
            Everything you need to run
            <br />
            <span className="text-[#f97316]">world-class events</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="features-grid font-[quicksand]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={cardVariants} className="feat-card">
              <div className="feat-card__inner font-[Quicksand]">
                {/* Background image */}
                <div
                  className="feat-card__bg"
                  style={{ backgroundImage: `url(${feature.bg})` }}
                />

                {/* Dark overlay + noise */}
                <div className="feat-card__overlay" />

                {/* Content */}
                <div className="feat-card__content">
                  {/* Icon + Title */}
                  <div className="feat-card__head">
                    <div className="feat-card__icon">{feature.icon}</div>
                    <h3 className="feat-card__title font-quicksand">{feature.title}</h3>
                  </div>

                  {/* Gold divider */}
                  <div className="feat-card__divider" />

                  {/* Description */}
                  <p className="feat-card__desc">{feature.description}</p>

                  {/* Hover CTA */}
                  <div className="feat-card__cta">Explore</div>
                </div>

                {/* Corner ornament */}
                <div className="feat-card__ornament" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 2. INTELLIGENT WORKFLOW — Image + Text
export function IntelligentWorkflow() {
  return (
    <section className=" inet relative overflow-hidden py-80 bg-white">
      {/* Top spacing from previous section */}
      <div className="max-w-7xl mx-auto px-20 lg:px-20 grid lg:grid-cols-2 gap-24 items-center">
        {/* Left Image */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative pl-6 lg:pl-12"
        >
          <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-xl">
            <Image
              src="/images/img.png"
              alt="Evensa Intelligent Workflow"
              width={900}
              height={700}
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Right Text */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <p className="text-xs font-bold tracking-[0.3em] text-orange-500 uppercase">
            SMART EVENT CONTROL
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#010127] leading-tight font-[Quicksand]">
            Plan → Launch → Optimize
            <br />
            {/* <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              all from one dashboard
            </span>*/}
          </h2>

          <div className="space-y-15">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#010127] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-orange-500 mt-[2px]"></span>
                Unified Event Management
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Control registrations, ticket tiers, speakers, and venues from a
                single structured workflow.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#010127] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-orange-500 mt-[2px]"></span>
                Real-Time Insights
              </h3>
              <p className="text-gray-500 leading-relaxed ml-5">
                Monitor attendance, engagement, and revenue instantly with live
                event analytics.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#010127] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-orange-500 mt-[2px]"></span>
                Action-Ready Tools
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Built-in check-in system, ticket validation, notifications, and
                performance optimization tools.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#010127] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-orange-500 mt-[2px]"></span>
                Always Operational
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Access and manage your events anytime from anywhere with full
                platform availability.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
// ════════════════════════════════════════════════════════════
// 3. FEATURES — 12 Cards
// ════════════════════════════════════════════════════════════
/*function FeaturesSection() {
  const features = [
  {
    icon: <CalendarCheck className="w-8 h-8" strokeWidth={1.2} />,
    title: "Advanced Event Creation",
    desc: "Rich descriptions, media uploads, draft/publish workflow, categories, tags, and SEO-friendly slugs.",
  },
  {
    icon: <ScanLine className="w-8 h-8" strokeWidth={1.2} />,
    title: "Live Check-In Scanner",
    desc: "Organizers scan QR codes at the door. Real-time check-in tracking with duplicate detection.",
  },
  {
    icon: <CreditCard className="w-8 h-8" strokeWidth={1.2} />,
    title: "Flexible Payments",
    desc: "Stripe for card payments. Bank transfers, cash, and JawwalPay for local markets. Free events too.",
  },
  {
    icon: <Users className="w-8 h-8" strokeWidth={1.2} />,
    title: "Role-Based Access Control",
    desc: "Three roles: Attendees discover & register, Organizers manage events, Admins oversee the platform.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8" strokeWidth={1.2} />,
    title: "Admin Control Center",
    desc: "Moderate events & feedback, manage users & roles, view audit logs, and edit platform settings.",
  },
  {
    icon: <Star className="w-8 h-8" strokeWidth={1.2} />,
    title: "Feedback & Reviews",
    desc: "Post-event ratings with title, comment, and stars. Admin moderation before public display.",
  },
  {
    icon: <Search className="w-8 h-8" strokeWidth={1.2} />,
    title: "Smart Discovery & Filters",
    desc: "Search by keyword. Filter by category, date, price, location, event type. Pagination built-in.",
  },
  {
    icon: <MapPin className="w-8 h-8" strokeWidth={1.2} />,
    title: "Online & In-Person Events",
    desc: "Physical venues with addresses, maps, and coordinates. Virtual events with meeting link integration.",
  },
  {
    icon: <Clock className="w-8 h-8" strokeWidth={1.2} />,
    title: "Waitlist Management",
    desc: "Automatic waitlist when events fill up. Attendees get notified instantly when spots open.",
  },
];

  return (
    <section className="py-28 bg-white relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <br></br> 
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-20">
              Everything You Need to{" "}
              <span className="text-orange-600">Run Events</span>
            </h2>
           <br></br> 
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            {features.map((f, i) => (
              <motion.div key={i} custom={i}>
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  description={f.desc}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
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
    <div className="group relative bg-white p-7 transition-all duration-500 h-full">
      <div className="absolute inset-0 rounded-2xl group-hover:to-transparent transition-all duration-500" />
      <div className="relative">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl text-white mb-5 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
*/
// ════════════════════════════════════════════════════════════
// 4. HOW IT WORKS
// ════════════════════════════════════════════════════════════
// Replace HowItWorksSection in app/page.tsx with this

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Create Your Account",
      desc: "Sign up in seconds with email or Google. Choose your path — discover events or start organizing.",
      detail: "Free forever for attendees",
    },
    {
      num: "02",
      title: "Discover or Create",
      desc: "Browse by category, date, or location. Organizers build rich event pages with pricing and media.",
      detail: "Smart filters & search",
    },
    {
      num: "03",
      title: "Register & Pay",
      desc: "One-click for free events. Secure Stripe checkout for paid ones. Your ticket is generated instantly.",
      detail: "Stripe-powered checkout",
    },
    {
      num: "04",
      title: "Attend & Review",
      desc: "Check in at the venue, enjoy the experience, then leave feedback to help the community grow.",
      detail: "Ratings & reviews",
    },
  ];

  return (
    <section
      style={{
        padding: "140px 0",
        background: "#0a0a0f",
        fontFamily: "'Quicksand', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", position: "relative" }}>
        {/* Header — centered */}
        <div style={{ textAlign: "center", marginBottom: "88px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: "20px",
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              margin: "0 0 16px 0",
            }}
          >
            Four steps to your
            <br />
            <span style={{ color: "#f97316" }}>next great event</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.35)",
              maxWidth: "440px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Whether you&apos;re attending or organizing, the journey is seamless
            from start to finish.
          </p>
        </div>

        {/* Steps — vertical layout with large numbers */}
        <div style={{ position: "relative" }}>
          {/* Vertical connecting line */}
          <div
            style={{
              position: "absolute",
              left: "60px",
              top: "40px",
              bottom: "40px",
              width: "1px",
              background: "linear-gradient(to bottom, transparent, rgba(249,115,22,0.2) 20%, rgba(249,115,22,0.2) 80%, transparent)",
            }}
            className="hidden md:block"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "48px",
                  padding: "40px 0",
                  borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  position: "relative",
                  transition: "background 0.3s",
                  borderRadius: "12px",
                  marginLeft: "-16px",
                  marginRight: "-16px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  const numEl = e.currentTarget.querySelector("[data-num]") as HTMLElement;
                  if (numEl) {
                    numEl.style.color = "#f97316";
                    numEl.style.textShadow = "0 0 40px rgba(249,115,22,0.3)";
                  }
                  const dotEl = e.currentTarget.querySelector("[data-dot]") as HTMLElement;
                  if (dotEl) {
                    dotEl.style.background = "#f97316";
                    dotEl.style.boxShadow = "0 0 12px rgba(249,115,22,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  const numEl = e.currentTarget.querySelector("[data-num]") as HTMLElement;
                  if (numEl) {
                    numEl.style.color = "rgba(255,255,255,0.06)";
                    numEl.style.textShadow = "none";
                  }
                  const dotEl = e.currentTarget.querySelector("[data-dot]") as HTMLElement;
                  if (dotEl) {
                    dotEl.style.background = "rgba(249,115,22,0.4)";
                    dotEl.style.boxShadow = "none";
                  }
                }}
              >
                {/* Large number */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  className="hidden md:flex"
                >
                  <span
                    data-num
                    style={{
                      fontSize: "80px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.06)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      transition: "color 0.4s, text-shadow 0.4s",
                      userSelect: "none",
                    }}
                  >
                    {step.num}
                  </span>

                  {/* Dot on the line */}
                  <div
                    data-dot
                    style={{
                      position: "absolute",
                      right: "-24px",
                      top: "50%",
                      transform: "translateY(-50%) translateX(50%)",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "rgba(249,115,22,0.4)",
                      transition: "background 0.3s, box-shadow 0.3s",
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: "8px" }}>
                  {/* Mobile number */}
                  <span
                    className="md:hidden"
                    style={{
                      display: "inline-block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#f97316",
                      letterSpacing: "0.15em",
                      marginBottom: "8px",
                    }}
                  >
                    STEP {step.num}
                  </span>

                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 10px 0",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.7,
                      margin: "0 0 16px 0",
                      maxWidth: "480px",
                    }}
                  >
                    {step.desc}
                  </p>

                  {/* Detail chip */}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 14px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#f97316",
                      background: "rgba(249,115,22,0.08)",
                      borderRadius: "100px",
                      border: "1px solid rgba(249,115,22,0.12)",
                    }}
                  >
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
// ════════════════════════════════════════════════════════════
// 5. PLATFORM SHOWCASE — Role-based tabs
// ════════════════════════════════════════════════════════════
function PlatformShowcaseSection() {
  const roles = [
    {
      label: "For Attendees",
      title: "Discover & Experience",
      desc: "Browse events with smart filters, register in one click, receive instant tickets, submit reviews, and join waitlists when events fill up.",
      features: [
        "Smart search & filters",
        "One-click registration",
        "Instant QR tickets",
        "Ratings & reviews",
        "Waitlist notifications",
      ],
      image: "/images/role-attendee.png",
      accent: "#3b82f6",
      accentBg: "rgba(59,130,246,0.06)",
      span: "1 / 2",  // takes left column
      rowSpan: "1 / 3", // spans 2 rows
    },
    {
      label: "For Organizers",
      title: "Create & Manage",
      desc: "Rich event editor, flexible pricing, real-time attendee tracking, revenue analytics, and feedback collection.",
      features: [
        "Rich event creation",
        "Stripe payments",
        "Attendee management",
        "Revenue tracking",
        "Post-event analytics",
      ],
      image: "/images/role-organizer.png",
      accent: "#f97316",
      accentBg: "rgba(249,115,22,0.06)",
      span: "2 / 3",
      rowSpan: "1 / 2",
    },
    {
      label: "For Admins",
      title: "Oversee & Optimize",
      desc: "Platform-wide metrics, user management, content moderation, and full administrative control.",
      features: [
        "Platform dashboard",
        "User & role management",
        "Content moderation",
        "System settings",
      ],
      image: "/images/role-admin.png",
      accent: "#8b5cf6",
      accentBg: "rgba(139,92,246,0.06)",
      span: "2 / 3",
      rowSpan: "2 / 3",
    },
  ];

  return (
    <section
      style={{
        padding: "140px 0",
        background: "#fafaf8",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: "16px",
            }}
          >
            The Platform
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.15,
              margin: "0 0 16px 0",
            }}
          >
            Built for <span style={{ color: "#f97316" }}>every role</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#888",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Three distinct experiences designed for attendees, organizers, and
            administrators. One powerful platform.
          </p>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: "20px",
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {roles.map((role, i) => (
            <div
              key={i}
              style={{
                gridColumn: role.span,
                gridRow: role.rowSpan,
                borderRadius: "16px",
                border: "1px solid #f0f0ec",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              className={i === 0 ? "lg:row-span-2" : ""}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#e5e5e0";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f0f0ec";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image area */}
              <div
                style={{
                  flex: i === 0 ? 1 : "none",
                  minHeight: i === 0 ? "300px" : "200px",
                  background: role.accentBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={role.image}
                  alt={role.title}
                  style={{
                    width: "88%",
                    height: "auto",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `
                        <div style="width:80%;height:70%;background:white;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.04);display:flex;flex-direction:column;padding:24px;gap:12px">
                          <div style="display:flex;gap:8px">
                            <div style="width:32px;height:32px;border-radius:8px;background:${role.accent}15"></div>
                            <div style="flex:1"><div style="height:10px;background:#f0f0ec;border-radius:4px;width:60%;margin-bottom:6px"></div><div style="height:8px;background:#f0f0ec;border-radius:4px;width:40%"></div></div>
                          </div>
                          <div style="flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center">
                            <div style="height:8px;background:#f0f0ec;border-radius:4px;width:90%"></div>
                            <div style="height:8px;background:#f0f0ec;border-radius:4px;width:70%"></div>
                            <div style="height:8px;background:#f0f0ec;border-radius:4px;width:80%"></div>
                          </div>
                          <div style="font-size:10px;color:#ccc;text-align:center">Add screenshot: ${role.image}</div>
                        </div>
                      `;
                    }
                  }}
                />

                {/* Role badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    background: role.accent,
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {role.label}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "28px 28px 32px" }}>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    margin: "0 0 8px 0",
                  }}
                >
                  {role.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#888",
                    lineHeight: 1.65,
                    margin: "0 0 20px 0",
                  }}
                >
                  {role.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {role.features.map((f, j) => (
                    <span
                      key={j}
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: role.accent,
                        background: role.accentBg,
                        borderRadius: "6px",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
      image: "/images/type-conference.png",
      color: "#1a1a2e",
    },
    {
      title: "Workshops & Training",
      desc: "Hands-on learning with limited capacity and approval-based registration.",
      image: "/images/type-workshop.png",
      color: "#1a2e1a",
    },
    {
      title: "Networking & Meetups",
      desc: "Community gatherings with free or paid entry and check-in tracking.",
      image: "/images/type-meetup.png",
      color: "#2e1a1a",
    },
    {
      title: "Webinars & Online",
      desc: "Virtual events with meeting link integration. No venue, global reach.",
      image: "/images/type-webinar.png",
      color: "#1a1a2e",
    },
    {
      title: "Fundraisers & Galas",
      desc: "Paid events with ticket management, revenue tracking, and receipts.",
      image: "/images/type-gala.png",
      color: "#2e1a2e",
    },
    {
      title: "Campus Events",
      desc: "Student-run events with admin oversight, waitlists, and feedback.",
      image: "/images/type-campus.png",
      color: "#1a2e2e",
    },
  ];

  return (
    <section
      style={{
        padding: "140px 0",
        background: "#fff",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#f97316",
              marginBottom: "16px",
            }}
          >
            Event Types
          </p>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.15,
              margin: "0 0 16px 0",
            }}
          >
            One platform,{" "}
            <span style={{ color: "#f97316" }}>endless possibilities</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#888",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            From intimate workshops to large-scale conferences, Evenza adapts
            to any event format.
          </p>
        </div>

        {/* Cards — 3 columns, image-forward */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {types.map((type, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                aspectRatio: "4 / 5",
                cursor: "default",
                transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.12)";
                // Zoom the background image
                const img = e.currentTarget.querySelector("img");
                if (img) (img as HTMLElement).style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                const img = e.currentTarget.querySelector("img");
                if (img) (img as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {/* Background image */}
              <img
                src={type.image}
                alt={type.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  if (target.parentElement) {
                    const fallback = document.createElement("div");
                    fallback.style.cssText = `position:absolute;inset:0;background:${type.color}`;
                    target.parentElement.insertBefore(fallback, target.parentElement.firstChild);
                  }
                }}
              />

              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.05) 100%)",
                }}
              />

              {/* Content pinned to bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "32px 24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 8px 0",
                  }}
                >
                  {type.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {type.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
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
    <section className="py-20 bg-white text-gray relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-6">
          {" "}
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
                <div className="text-3xl font-bold text-gray mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
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
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-6">
          {" "}
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
              <span className="text-orange-600">
                Organizers &amp; Attendees
              </span>
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
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-6">
          {" "}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
              Simple, <span className="text-orange-600">Transparent</span>{" "}
              Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Free for attendees. Affordable for organizers. No hidden fees
              ever.
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
    <section className="py-28">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-6">
          {" "}
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
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 11. FINAL CTA
// ════════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section className="relative py-32 text-gray-700 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-full h-px" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full flex justify-center"
      >
        <div className=" w-full max-w-4xl px-6">
          {" "}
          <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">
            Ready to Create Your
            <span className=" text-orange">
              Next Great Event?
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-12 leading-relaxed">
            Whether you&apos;re hosting or attending, your next unforgettable
            experience starts here. Get started in minutes — completely free.
          </p>
          {/* Mini trust bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-700">
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
        </div>
      </motion.div>
    </section>
  );
}
