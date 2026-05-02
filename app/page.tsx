// app/page.tsx
// Evenza Landing Page —  homepage
"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Link from "next/link";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  CalendarCheck,
  Ticket,
  Users,
  CreditCard,
  Globe,
  Star,
  CheckCircle2,
  Lock,
  Clock,
} from "lucide-react";
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
      <main className="bg-gradient-to-r from-[#fff] to-[#fffffe]">
        {" "}
        <HeroSection />
        <div className="flex flex-col gap-20">
          <FeaturesShowcase />
          <IntelligentWorkflow />
          <HowItWorksSection />
          <PlatformShowcaseSection />
          <EventTypesSection />
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
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
 
  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#06060a",
        overflow: "hidden",
        //fontFamily: "'Quicksand', sans-serif",
      }}
    >
      {/* Background — subtle grid + single warm glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        {/* Single centered glow */}
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(234,88,12,0.07) 0%, transparent 65%)",
          }}
        />
        {/* Top edge fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(to bottom, #06060a, transparent)",
          }}
        />
      </div>
       <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: "400px",
            height: "700px",
            background: "radial-gradient(circle, rgba(248, 96, 15, 0.25) 0%, rgba(226, 120, 45, 0.12) 35%, rgba(123, 69, 248, 0.04) 60%, transparent 80%)",
            //borderRadius: "20%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
 
      <motion.div
        style={{ opacity, y }}
        className="relative z-10"
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            padding: "0 32px",
          }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#ea580c",
                marginBottom: "28px",
              }}
            >
              Event Management Platform
            </span>
          </motion.div>
 
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#fff",
              margin: "0 0 24px 0",
            }}
          >
              WHERE EVERY EVENT
            <br />
            FINDS ITS{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #ea580c, #f97316, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AUDIENCE
            </span>
          </motion.h1>
 
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.35)",
              maxWidth: "520px",
              margin: "0 auto 48px",
            }}
          >
            Plan, launch, and scale events with precision. Complete control
            for organizers, seamless access for attendees.
          </motion.p>
 
          {/* CTA buttons */}
          
        <Link href="/#platform" className="mb-[48px] inline-block">
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
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              marginTop: "56px",
              flexWrap: "wrap",
            }}
          >
            {[
              "Free to start",
              "No credit card needed",
              "Setup in minutes",
            ].map((text, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.56)",
                  fontWeight: 500,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.3 4.3L6.3 11.3L2.7 7.7"
                    stroke="rgba(234,88,12,0.5)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
 
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "24px",
            height: "40px",
            borderRadius: "12px",
            border: "1.5px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              width: "3px",
              height: "8px",
              borderRadius: "2px",
              background: "rgba(234,88,12,0.4)",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
 
// ════════════════════════════════════════════════════════════
// 2. FEATURES SHOWCASE — Icon-forward bento grid
// ════════════════════════════════════════════════════════════
const features = [
  {
    title: "In-Person Events",
    tag: "VENUE",
    num: "01",
    desc: "Rich event pages with media galleries, venue maps, capacity controls, and on-site check-in tools.",
    accent: "#777371",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Virtual Events",
    tag: "REMOTE",
    num: "02",
    desc: "Meeting link integration with instant ticket delivery. Global reach, no venue needed.",
    accent: "#6d2501",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: "Hybrid Events",
    tag: "UNIFIED",
    num: "03",
    desc: "Combine physical and virtual. One registration flow, two audiences.",
    accent: "#777371",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    tag: "STRIPE",
    num: "04",
    desc: "SSL-encrypted checkout. Free events, paid tickets, and local payment methods.",
    accent: "#6d2501",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: "Real-Time Analytics",
    tag: "LIVE DATA",
    num: "05",
    desc: "Track registrations, revenue, and attendee engagement from a live dashboard.",
    accent: "#777371",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Custom Branding",
    tag: "DESIGN",
    num: "06",
    desc: "Your logo, colors, and domain. Events that feel like yours from start to finish.",
    accent: "#6d2501",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
      </svg>
    ),
  },
  {
    title: "Smart Check-In",
    tag: "ON-SITE",
    num: "07",
    desc: "QR scanning, attendee search, and walk-in registration all from your phone.",
    accent: "#6d2501",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

const row1 = [...features, ...features];
const row2 = [...features.slice(2), ...features.slice(2)];

interface Feature {
  title: string;
  tag: string;
  num: string;
  desc: string;
  accent: string;
  icon: React.ReactNode;
}

function FeatureCard({ f }: { f: Feature }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: "290px",
        background: "#0e0e0e",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        padding: "26px",
        position: "relative",
        overflow: "hidden",
        marginRight: "14px",
        transition: "border-color 0.35s ease, transform 0.35s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${f.accent}45`;
        e.currentTarget.style.transform = "translateY(-5px) scale(1.01)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Ghost number bg */}
      <div style={{
        position: "absolute",
        right: "12px",
        bottom: "-12px",
        fontFamily: "'Bebas Neue', Impact, sans-serif",
        fontSize: "90px",
        fontWeight: 900,
        color: "rgba(255,255,255,0.028)",
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
        letterSpacing: "-0.02em",
      }}>
        {f.num}
      </div>

      {/* Top accent bar */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "26px",
        right: "80px",
        height: "2px",
        background: `linear-gradient(90deg, ${f.accent}, ${f.accent}00)`,
        borderRadius: "0 0 2px 2px",
      }} />

      {/* Icon + tag row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `${f.accent}14`,
          border: `1px solid ${f.accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: f.accent,
        }}>
          {f.icon}
        </div>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: f.accent,
          background: `${f.accent}10`,
          border: `1px solid ${f.accent}18`,
          padding: "3px 9px",
          borderRadius: "100px",
        }}>
          {f.tag}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 600,
        fontSize: "20px",
        color: "#f0ede8",
        margin: "0 0 9px",
        letterSpacing: "0.03em",
        lineHeight: 1.1,
      }}>
        {f.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        color: "rgba(255,255,255,0.27)",
        lineHeight: 1.9,
        margin: 0,
      }}>
        {f.desc}
      </p>
    </div>
  );
}

function FeaturesShowcase() {
  return (
    <>
      <style>{`
        @keyframes slide-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes slide-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }

        .track-l { animation: slide-left  34s linear infinite; }
        .track-r { animation: slide-right 30s linear infinite; }

        .mq-outer:hover .track-l,
        .mq-outer:hover .track-r {
          animation-play-state: paused;
        }

        .mq-fade {
          position: relative;
        }
        .mq-fade::before, .mq-fade::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 140px;
          z-index: 2;
          pointer-events: none;
        }
        .mq-fade::before { left: 0;  background: linear-gradient(90deg, #080808, transparent); }
        .mq-fade::after  { right: 0; background: linear-gradient(-90deg, #080808, transparent); }
      `}</style>

      <section style={{
        padding: "96px 0 108px",
        background: "#080808",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Subtle radial warmth at top */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(232,88,28,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ maxWidth: "900px", margin: "0 auto 60px", padding: "0 40px" }}>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "9.5px",
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#e8581c",
            margin: "0 0 20px",
          }}>
            Platform Features
          </p>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "32px", flexWrap: "wrap" }}>
              <p style={{
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#f7efeb",
            margin: "0 0 20px",
          }}>
              From Registration to check-in one Platform handles it all.
          </p>
          </div>

          <div style={{
            marginTop: "44px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent)",
          }} />
        </div>

        {/* Marquee row 1 — left */}
        <div className="mq-fade mq-outer" style={{ marginBottom: "14px" }}>
          <div className="track-l" style={{ display: "flex", width: "max-content", paddingLeft: "14px" }}>
            {row1.map((f, i) => <FeatureCard key={`r1-${i}`} f={f} />)}
          </div>
        </div>

        {/* Marquee row 2 — right */}
        <div className="mq-fade mq-outer">
          <div className="track-r" style={{ display: "flex", width: "max-content", paddingLeft: "14px" }}>
            {row2.map((f, i) => <FeatureCard key={`r2-${i}`} f={f} />)}
          </div>
        </div>
      </section>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// 3. INTELLIGENT WORKFLOW — Image + Text
export function IntelligentWorkflow() {
  return (
    <section id= "worflow"
    className="inet relative overflow-hidden py-80 bg-white">
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

          <h2 className="text-2xl md:text-4xl text-[#010127] leading-tight font-[Rubik]">
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
    <section id= "how-it-works"
      style={{
        padding: "140px 0",
        background: "#0a0a0f",
        fontFamily: "Rubik",
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
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 32px",
          position: "relative",
        }}
      >
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
              background:
                "linear-gradient(to bottom, transparent, rgba(249,115,22,0.2) 20%, rgba(249,115,22,0.2) 80%, transparent)",
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
                  borderBottom:
                    i < steps.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
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
                  const numEl = e.currentTarget.querySelector(
                    "[data-num]",
                  ) as HTMLElement;
                  if (numEl) {
                    numEl.style.color = "#f97316";
                  }
                  const dotEl = e.currentTarget.querySelector(
                    "[data-dot]",
                  ) as HTMLElement;
                  if (dotEl) {
                    dotEl.style.background = "#f97316";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  const numEl = e.currentTarget.querySelector(
                    "[data-num]",
                  ) as HTMLElement;
                  if (numEl) {
                    numEl.style.color = "rgba(255,255,255,0.06)";
                    numEl.style.textShadow = "none";
                  }
                  const dotEl = e.currentTarget.querySelector(
                    "[data-dot]",
                  ) as HTMLElement;
                  if (dotEl) {
                    dotEl.style.background = "rgba(249,115,22,0.4)";
                  }
                }}
              >
                {/* Large number */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "100px",
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
                      fontSize: "70px",
                      fontWeight: 600,
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
      image: "/images/attendee.png",
      accent: "#3b82f6",
      accentBg: "rgba(59,130,246,0.06)",
      span: "1 / 2", // takes left column
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
      image: "/images/organizer.png",
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
      image: "/images/admin.png",
      accent: "#8b5cf6",
      accentBg: "rgba(139,92,246,0.06)",
      span: "2 / 3",
      rowSpan: "2 / 3",
      style: { AlignCenter: "center" },
    },
  ];

  return (
    <section id = "platform"
      style={{
        padding: "45px 0",
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
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
          className="grid-cols-1 lg:grid-cols-3"
        >
          {roles.map((role, i) => (
            <div
              key={i}
              style={{
                borderRadius: "16px",
                border: "1px solid #f0f0ec",
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
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
                  flex: "none",
                  height: "280px",
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
                    width: "100%",
                    height: "100%",
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
      image: "/images/Conferences.jpg",
      color: "#1a1a2e",
    },
    {
      title: "Workshops & Training",
      desc: "Hands-on learning with limited capacity and approval-based registration.",
      image: "/images/Workshops.jpg",
      color: "#1a2e1a",
    },
   
    {
      title: "Webinars & Online",
      desc: "Virtual events with meeting link integration. No venue, global reach.",
      image: "/images/Webinars.png",
      color: "#1a1a2e",
    },
     {
      title: "Networking & Meetups",
      desc: "Community gatherings with free or paid entry and check-in tracking.",
      image: "/images/Networking.jpg",
      color: "#2e1a1a",
    },
    {
      title: "Fundraisers & Galas",
      desc: "Paid events with ticket management, revenue tracking, and receipts.",
      image: "/images/Fundraisers.png",
      color: "#2e1a2e",
    },
    {
      title: "Campus Events",
      desc: "Student-run events with admin oversight, waitlists, and feedback.",
      image: "/images/Campus.png",
      color: "#1a2e2e",
    },
  ];

  return (
    <section id = "event-types"
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
            From intimate workshops to large-scale conferences, Evenza adapts to
            any event format.
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
                transition:
                  "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 48px rgba(0,0,0,0.12)";
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
                    target.parentElement.insertBefore(
                      fallback,
                      target.parentElement.firstChild,
                    );
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
// 8. PRICING PREVIEW
// ════════════════════════════════════════════════════════════
// Replace PricingPreviewSection in app/page.tsx with this

function PricingPreviewSection() {
  const plans = [
    {
      name: "Free",
      desc: "For attendees and casual users getting started.",
      price: "$0",
      period: "forever",
      features: [
        "Browse all events",
        "Register for free events",
        "QR code tickets",
        "Submit feedback & reviews",
        "In-app notifications",
      ],
      cta: "Get Started",
      ctaStyle: "outline" as const,
      highlighted: false,
    },
    {
      name: "Organizer",
      desc: "For event creators who need full control over their events.",
      price: "$25",
      period: "per month",
      features: [
        "Create unlimited events",
        "Sell paid tickets via Stripe",
        "Attendee management tools",
        "Analytics dashboard",
        "Waitlist management",
        "Revenue tracking",
      ],
      cta: "Start Organizing",
      ctaStyle: "solid" as const,
      highlighted: true,
    },
    {
      name: "Enterprise",
      desc: "For large organizations with advanced needs.",
      price: "Custom",
      period: "",
      features: [
        "Everything in Organizer",
        "Custom branding & themes",
        "Priority support",
        "API access",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      ctaStyle: "outline" as const,
      highlighted: false,
    },
  ];

  return (
    <section
      style={{
        padding: "120px 0",
        fontFamily: "'Quicksand', sans-serif",
        position: "relative",
        overflow: "hidden",
        // Warm tinted background
        background: "#fafaf8",
      }}
    >
      {/* ── Decorative background elements ── */}

      {/* Soft grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Top-right decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(249,115,22,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "210px",
          height: "210px",
          borderRadius: "50%",
          border: "1px solid rgba(249,115,22,0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom-left decorative circle */}
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          border: "1px solid rgba(0,0,0,0.03)",
          pointerEvents: "none",
        }}
      />

      {/* Warm glow behind cards */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -40%)",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 32px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.15,
              margin: "0 0 14px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Choose Your Plan
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#999",
              maxWidth: "380px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Affordable and adaptable pricing to suit your goals.
          </p>
        </div>

        {/* Cards container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
            alignItems: "stretch",
            // Outer wrapper shadow for depth
            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.04))",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {plans.map((plan, i) => {
            const isLeft = i === 0;
            const isRight = i === 2;
            const isMid = plan.highlighted;

            return (
              <div
                key={i}
                style={{
                  background: isMid
                    ? "linear-gradient(180deg, #ffffff 0%, #fafcff 100%)"
                    : "#fff",
                  border: isMid ? "2px solid #1a1a2e" : "1px solid #e0ddd8",
                  borderRadius: isMid
                    ? "20px"
                    : isLeft
                      ? "20px 0 0 20px"
                      : isRight
                        ? "0 20px 20px 0"
                        : "0",
                  padding: isMid ? "36px 36px 32px" : "32px 32px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  zIndex: isMid ? 3 : 1,
                  marginTop: isMid ? "-16px" : "0",
                  marginBottom: isMid ? "-16px" : "0",
                  boxShadow: isMid
                    ? "0 20px 60px rgba(26,26,46,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
                    : "inset 0 1px 0 rgba(255,255,255,0.6)",
                  transition:
                    "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s",
                }}
                onMouseEnter={(e) => {
                  if (isMid) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 28px 70px rgba(26,26,46,0.16), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)";
                  } else {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isMid
                    ? "0 20px 60px rgba(26,26,46,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
                    : "inset 0 1px 0 rgba(255,255,255,0.6)";
                }}
              >
                {/* Corner ornament on highlighted card */}
                {isMid && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: "1px solid rgba(249,115,22,0.1)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "24px",
                        right: "24px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "1px solid rgba(249,115,22,0.06)",
                        pointerEvents: "none",
                      }}
                    />
                  </>
                )}

                {/* Recommended badge */}
                {isMid && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "6px 20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: "#fff",
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)",
                      borderRadius: "100px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(26,26,46,0.2)",
                    }}
                  >
                    Recommended for you
                  </div>
                )}

                {/* Plan name */}
                <h3
                  style={{
                    fontSize: isMid ? "24px" : "22px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    margin: "0 0 6px 0",
                  }}
                >
                  {plan.name}
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#aaa",
                    lineHeight: 1.5,
                    margin: "0 0 28px 0",
                  }}
                >
                  {plan.desc}
                </p>

                {/* Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: isMid ? "48px" : "42px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#bbb",
                        fontWeight: 500,
                      }}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>

                {/* Divider with gradient */}
                <div
                  style={{
                    height: "1px",
                    background: isMid
                      ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.15), transparent)"
                      : "linear-gradient(90deg, transparent, #e5e5e0, transparent)",
                    marginBottom: "24px",
                  }}
                />

                {/* What's included */}
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    margin: "0 0 18px 0",
                  }}
                >
                  What&apos;s included:
                </p>

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 36px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    flex: 1,
                  }}
                >
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        fontSize: "14px",
                        color: "#555",
                        lineHeight: 1.4,
                      }}
                    >
                      {/* Checkmark with colored background */}
                      <span
                        style={{
                          flexShrink: 0,
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: isMid
                            ? "rgba(249,115,22,0.1)"
                            : "rgba(45,106,79,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "1px",
                        }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M13.3 4.3L6.3 11.3L2.7 7.7"
                            stroke={isMid ? "#ea580c" : "#2d6a4f"}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/sign-up"}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "15px 0",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: "'Quicksand', sans-serif",
                    borderRadius: "12px",
                    textDecoration: "none",
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                    ...(plan.ctaStyle === "solid"
                      ? {
                          background:
                            "linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)",
                          color: "#fff",
                          border: "none",
                          boxShadow:
                            "0 4px 16px rgba(26,26,46,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }
                      : {
                          background: "transparent",
                          color: "#1a1a1a",
                          border: "1.5px solid #d5d2cd",
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (plan.ctaStyle === "solid") {
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(26,26,46,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    } else {
                      e.currentTarget.style.borderColor = "#1a1a1a";
                      e.currentTarget.style.background = "rgba(26,26,26,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.ctaStyle === "solid") {
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(26,26,46,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    } else {
                      e.currentTarget.style.borderColor = "#d5d2cd";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
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
      icon: <CreditCard style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "How do QR code tickets work?",
      a: "When you register for an event (free or paid), a unique QR code ticket is automatically generated and saved to your account. At the event venue, the organizer scans your QR code using the built-in scanner to validate your entry. Each code can only be used once.",
      icon: <Ticket style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "Can I create both free and paid events?",
      a: "Absolutely. Organizers can create free events where registration is instant, or paid events with Stripe checkout for card payments. We also support bank transfers, cash payments, and local gateways like JawwalPay.",
      icon: <CalendarCheck style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "What happens if an event is full?",
      a: "If the organizer enables the waitlist feature, you can join the waiting queue. When a spot opens up due to a cancellation, the next person in line is automatically notified and gets the opportunity to register.",
      icon: <Users style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "How does the feedback system work?",
      a: "After an event ends, attendees can leave a star rating (1-5) and a written review. All feedback goes through admin moderation before being displayed publicly on the event page. This ensures quality and prevents spam.",
      icon: <Star style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "Is my payment information secure?",
      a: "Yes. All payments are processed through Stripe with industry-standard PCI DSS compliance and 256-bit SSL encryption. We never store your card details on our servers. Stripe handles all sensitive payment data.",
      icon: <Lock style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "Can I cancel my registration?",
      a: "Yes, you can cancel your registration at any time before the event starts. For free events, the cancellation is instant. For paid events, refund policies are set by the event organizer.",
      icon: <Clock style={{ width: "18px", height: "18px" }} />,
    },
    {
      q: "What kind of events can I create?",
      a: "Any kind! Conferences, workshops, webinars, meetups, fundraisers, university events, corporate training, networking sessions — both online and in-person. The platform adapts to your event type.",
      icon: <Globe style={{ width: "18px", height: "18px" }} />,
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" 
      style={{
        padding: "50px 0",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.2,
              margin: "0 0 12px 0",
              //fontStyle: "italic",
              letterSpacing: "-0.02em",
            }}
          >
            Frequently asked questions
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "#999",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link
              href="/contact"
              style={{
                color: "#1a1a1a",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                textDecorationColor: "#ddd",
              }}
            >
              Contact our team
            </Link>{" "}
            for help.
          </p>
        </div>

        {/* FAQ items */}
        <div>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  borderBottom:
                    i < faqs.length - 1 ? "1px solid #f0f0ec" : "none",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "20px 0",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Quicksand', sans-serif",
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{
                      flexShrink: 0,
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: isOpen ? "rgba(249,115,22,0.08)" : "#f8f8f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#220d01" : "#bbb",
                      transition: "background 0.25s, color 0.25s",
                    }}
                  >
                    {faq.icon}
                  </span>

                  {/* Question */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>

                  {/* Chevron */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition:
                        "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                      color: isOpen ? "#ea580c" : "#ccc",
                    }}
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Answer — CSS-only expand */}
                <div
                  style={{
                    maxHeight: isOpen ? "300px" : "0",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition:
                      "max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      paddingLeft: "56px",
                      paddingBottom: "20px",
                      paddingRight: "32px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#777",
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// 11. FINAL CTA
// ════════════════════════════════════════════════════════════
// components/landing/CTASection.tsx

const ctaFeatures = [
  "Create registration pages in minutes — no coding needed.",
  "Automatically send calendar invites to boost attendance.",
  "Enable waitlists to manage exclusive access.",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

 function CTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "120px 0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(234,88,12,0.04) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 48px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="lg:grid-cols-2 grid-cols-1"
        >
          {/* ── Left: Text Content ── */}
          <div>
            {/* Eyebrow */}
            <motion.div
              custom={0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "2px",
                  background: "#ea580c",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#ea580c",
                }}
              >
                Get Started
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              custom={1}
              style={{
                fontFamily: "Quicksand, sans-serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
                margin: "0 0 20px 0",
              }}
            >
              Set up and host your events{" "}
              <span style={{ color: "#ea580c" }}>with ease.</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              custom={2}
              style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "#666",
                maxWidth: "440px",
                margin: "0 0 40px 0",
              }}
            >
              Manage events with simplified set-up and streamlined
              registration. Get started in minutes — completely free.
            </motion.p>

            {/* Feature list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginBottom: "48px",
              }}
            >
              {ctaFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  custom={3 + i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ea580c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    <CheckCircle2
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#fff",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: "#333",
                      fontWeight: 500,
                    }}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              custom={6}
              style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
            >
              <Link
                href="/events"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 32px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "Quicksand",
                  color: "#fff",
                  background: "#ea580c",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                  boxShadow: "0 2px 12px rgba(234,88,12,0.25)",
                }}
                className="hover:shadow-lg"
              >
                Browse Events
              </Link>
              <Link
                href="/organizer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "Quicksand",
                  color: "#1a1a1a",
                  background: "transparent",
                  border: "1px solid #d4d4d0",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                }}
              >
                Create an Event
              </Link>
            </motion.div>
          </div>

          {/* ── Right: Product Mockup ── */}
          <motion.div className="relative hidden lg:block">
            {/* Orange background container */}
            <div
              style={{
                position: "relative",
                // image as background from public folder, set to cover and centered
                backgroundPosition: "center",
                borderRadius: "20px",
                padding: "32px 28px 28px",
                boxShadow:
                  "0 25px 60px -12px rgba(234,88,12,0.3), 0 0 0 1px rgba(234,88,12,0.1)",
              }}
            >
              {/* Decorative dots */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              />

              {/* Browser-style mockup frame */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                {/* Browser bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    background: "#f8f8f6",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#febc2e" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28c840" }} />
                  <div
                    style={{
                      flex: 1,
                      marginLeft: "12px",
                      padding: "4px 12px",
                      fontSize: "10px",
                      color: "#999",
                      background: "#fff",
                      borderRadius: "4px",
                      border: "1px solid #eee",
                    }}
                  >
                    evenza.app/events/create
                  </div>
                </div>

                {/* Mock content — two-pane editor layout */}
                <div style={{ display: "flex", minHeight: "320px" , fontFamily: "'Quicksand'"}}>
                  {/* Left pane: form controls */}
                  <div
                    style={{
                      width: "48%",
                      padding: "20px 18px",
                      borderRight: "1px solid #f0f0ec",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#999" }}>←</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1a1a" }}>
                        Event Setup
                      </span>
                    </div>

                    {/* Tab row */}
                    <div style={{ display: "flex", gap: "4px" }}>
                      {["Content", "Styles", "Settings"].map((tab, i) => (
                        <div
                          key={tab}
                          style={{
                            padding: "5px 12px",
                            fontSize: "10px",
                            fontWeight: 600,
                            borderRadius: "4px",
                            background: i === 0 ? "#1a1a1a" : "#f5f5f0",
                            color: i === 0 ? "#fff" : "#888",
                          }}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Form fields */}
                    <MockField label="Event Title">
                      <div style={{ padding: "7px 10px", background: "#fef2f2", borderRadius: "4px", fontSize: "10px", color: "#ea580c", fontWeight: 500 }}>
                        Tech Conference 2026
                      </div>
                    </MockField>

                    <MockField label="Date & Time">
                      <div style={{ padding: "7px 10px", background: "#fef2f2", borderRadius: "4px", fontSize: "10px", color: "#ea580c", fontWeight: 500 }}>
                        March 28, 6:30 PM
                      </div>
                    </MockField>

                    <MockField label="Location">
                      <div style={{ padding: "7px 10px", background: "#f5f5f0", borderRadius: "4px", fontSize: "10px", color: "#666" }}>
                        Convention Center, Hall B
                      </div>
                    </MockField>

                    {/* Toggle row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "#555" }}>Waitlist</span>
                      <div
                        style={{
                          width: "32px",
                          height: "18px",
                          borderRadius: "9px",
                          background: "#ea580c",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Button */}
                    <div
                      style={{
                        marginTop: "auto",
                        padding: "8px 0",
                        textAlign: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#fff",
                        background: "#ea580c",
                        borderRadius: "5px",
                      }}
                    >
                      Publish Event
                    </div>
                  </div>

                  {/* Right pane: preview */}
                  <div
                    style={{
                      width: "52%",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "320px",
                    }}
                  >
                   {/* Background image */}
                    <Image
                      src="/images/conference.png"
                      alt="Event preview"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />

                    {/* Overlay content */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "20px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "rgba(255,255,255,0.6)",
                          marginBottom: "6px",
                        }}
                      >
                        Live Preview
                      </span>
                      <span
                        style={{
                          fontFamily:'Quicksand',
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1.25,
                          marginBottom: "8px",
                        }}
                      >
                        Tech Conference
                        <br />
                        2026
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: "12px",
                        }}
                      >
                        March 28 · Convention Center
                      </span>
                      <div
                        style={{
                          display: "inline-flex",
                          alignSelf: "flex-start",
                          padding: "6px 16px",
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#fff",
                          background: "#ea580c",
                          borderRadius: "4px",
                        }}
                      >
                        Register
                      </div>
                    </div>

                    {/* Decorative geometric shapes */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        width: "40px",
                        height: "40px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "50%",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "45px",
                        right: "40px",
                        width: "20px",
                        height: "20px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{
                position: "absolute",
                bottom: "-16px",
                left: "-24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(45,106,79,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 style={{ width: "14px", height: "14px", color: "#2d6a4f" }} />
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#1a1a1a", margin: 0 , fontFamily:'Quicksand'}}>
                  Setup in under 5 min
                </p>
                <p style={{ fontSize: "9px", color: "#999", margin: 0 , fontFamily:'Quicksand'}}>
                  No credit card required
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Tiny helper for mock form fields ─── */
function MockField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: "9px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#999",
          marginBottom: "4px",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}