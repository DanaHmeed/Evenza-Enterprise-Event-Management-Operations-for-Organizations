// app/(root)/about/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Globe,
  Users,
  Ticket,
  ShieldCheck,
  CalendarCheck,
  Sparkles,
  Heart,
  ArrowRight,
  QrCode,
  BarChart3,
  CreditCard,
  Mail,
  Zap,
} from "lucide-react";

const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  accentMid: "rgba(230,57,70,0.14)",
  green: "#2d6a4f",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

const stats = [
  { value: "10+", label: "Event Categories" },
  { value: "100%", label: "Secure Payments" },
  { value: "1-Click", label: "QR Check-in" },
  { value: "24/7", label: "Platform Uptime" },
];

const capabilities = [
  {
    icon: <CalendarCheck style={{ width: "20px", height: "20px" }} />,
    title: "Event Creation & Management",
    desc: "Create professional event pages with rich descriptions, banners, pricing tiers, and capacity controls — all from one dashboard.",
  },
  {
    icon: <Ticket style={{ width: "20px", height: "20px" }} />,
    title: "Registration & Ticketing",
    desc: "Free and paid registration flows with real-time seat tracking, waitlists, and organizer approval workflows.",
  },
  {
    icon: <CreditCard style={{ width: "20px", height: "20px" }} />,
    title: "Secure Payments",
    desc: "Stripe-powered checkout with SSL encryption. Attendees pay securely, organizers get paid reliably.",
  },
  {
    icon: <QrCode style={{ width: "20px", height: "20px" }} />,
    title: "QR Code Check-in",
    desc: "Every ticket includes a unique QR code. Organizers scan on arrival for instant, paperless check-in.",
  },
  {
    icon: <BarChart3 style={{ width: "20px", height: "20px" }} />,
    title: "Analytics & Insights",
    desc: "Track registrations, attendance, revenue, and feedback ratings — all in real-time from the organizer dashboard.",
  },
  {
    icon: <Mail style={{ width: "20px", height: "20px" }} />,
    title: "Attendee Communication",
    desc: "Automated confirmation emails, event reminders, and post-event feedback collection keep attendees in the loop.",
  },
];

const values = [
  {
    icon: <Globe style={{ width: "18px", height: "18px" }} />,
    title: "Accessible to Everyone",
    desc: "No technical skill required. Universities, startups, and individual creators can publish events in minutes.",
  },
  {
    icon: <ShieldCheck style={{ width: "18px", height: "18px" }} />,
    title: "Secure & Trustworthy",
    desc: "Stripe payments, Clerk authentication, QR ticket verification, and admin moderation keep the platform safe.",
  },
  {
    icon: <Users style={{ width: "18px", height: "18px" }} />,
    title: "Community First",
    desc: "Built for the Palestinian community and beyond — designed for local organizers, built to scale globally.",
  },
  {
    icon: <Zap style={{ width: "18px", height: "18px" }} />,
    title: "End-to-End Solution",
    desc: "From event creation to check-in to post-event feedback — one platform handles the entire lifecycle.",
  },
  {
    icon: <Sparkles style={{ width: "18px", height: "18px" }} />,
    title: "Modern Experience",
    desc: "Responsive design, smooth transitions, real-time updates, and a clean interface built with the latest web technologies.",
  },
  {
    icon: <Heart style={{ width: "18px", height: "18px" }} />,
    title: "Made with Intention",
    desc: "Every feature was carefully designed and coded. This is more than a project — it's a platform we believe in.",
  },
];

const techStack = [
  { label: "Next.js 15", color: "#000" },
  { label: "React 19", color: "#61DAFB" },
  { label: "TypeScript", color: "#3178C6" },
  { label: "Tailwind CSS", color: "#38BDF8" },
  { label: "Prisma ORM", color: "#5a67d8" },
  { label: "PostgreSQL", color: "#336791" },
  { label: "Clerk Auth", color: "#6C47FF" },
  { label: "Stripe Payments", color: "#635BFF" },
  { label: "Framer Motion", color: "#FF0080" },
  { label: "Lucide Icons", color: "#f97316" },
  { label: "Zod Validation", color: "#3068b7" },
];

function CapabilityCard({ cap, index }: { cap: (typeof capabilities)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fdfcfc" : t.surface,
        padding: "36px 32px",
        position: "relative",
        transition: "background 0.2s",
        cursor: "default",
        borderTop: `2px solid ${hovered ? t.accent : "transparent"}`,
      }}
    >
      {/* Subtle index number watermark */}
      <span
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: hovered ? t.accent : t.borderLight,
          transition: "color 0.2s",
          fontFamily: t.sans,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        style={{
          width: "42px",
          height: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: hovered ? t.accentMid : t.accentSoft,
          borderRadius: "8px",
          color: t.accent,
          marginBottom: "20px",
          transition: "background 0.2s",
        }}
      >
        {cap.icon}
      </div>
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: t.text,
          margin: "0 0 10px 0",
          letterSpacing: "-0.01em",
        }}
      >
        {cap.title}
      </h3>
      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.65,
          color: t.textMuted,
          margin: 0,
        }}
      >
        {cap.desc}
      </p>
    </div>
  );
}

function ValueCard({ val, index }: { val: (typeof values)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "28px",
        border: `1px solid ${hovered ? t.border : t.borderLight}`,
        borderRadius: "10px",
        background: hovered ? "#fdfcfc" : "transparent",
        transition: "all 0.2s",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: hovered ? t.accentMid : t.accentSoft,
            borderRadius: "6px",
            color: t.accent,
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          {val.icon}
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: hovered ? t.accent : t.textFaint,
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: t.text,
          margin: "0 0 8px 0",
          letterSpacing: "-0.01em",
        }}
      >
        {val.title}
      </h3>
      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.65,
          color: t.textMuted,
          margin: 0,
        }}
      >
        {val.desc}
      </p>
    </div>
  );
}

function TechPill({ tech }: { tech: (typeof techStack)[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "7px 16px",
        fontSize: "12.5px",
        fontWeight: 500,
        color: hovered ? tech.color : t.textSecondary,
        background: t.bg,
        border: `1px solid ${hovered ? tech.color + "44" : t.borderLight}`,
        borderRadius: "20px",
        transition: "all 0.18s",
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: tech.color,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.18s",
          flexShrink: 0,
        }}
      />
      {tech.label}
    </span>
  );
}

export default function AboutPage() {
  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#06060a",
          padding: "130px 48px 0",
        }}
      >
        {/* Dot grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        {/* Primary accent orb */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "15%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "500px",
            background:
              "radial-gradient(ellipse, rgba(230,57,70,0.10) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Secondary soft orb */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-60px",
            width: "420px",
            height: "420px",
            background:
              "radial-gradient(circle, rgba(99,91,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "960px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px 6px 10px",
              border: "1px solid rgba(230,57,70,0.25)",
              borderRadius: "20px",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: t.accent,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: t.accent,
              }}
            >
              About Evenza
            </span>
          </div>

          <h1
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              margin: "0 0 28px 0",
            }}
          >
            Bringing people together
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>
              through live experiences.
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.48)",
              maxWidth: "580px",
              margin: "0 0 64px 0",
            }}
          >
            Evenza is a full-stack event management platform designed to connect
            organizers with attendees — from discovery and registration to
            check-in and feedback.
          </p>
        </div>

        {/* Stats strip — anchored to bottom of hero */}
        <div
          style={{
            position: "relative",
            maxWidth: "960px",
            margin: "0 auto",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "32px 0",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                paddingLeft: i === 0 ? 0 : "32px",
              }}
            >
              <div
                style={{
                  fontFamily: t.serif,
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ──────────────────────────── */}
      <section
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "100px 48px",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div style={{ width: "28px", height: "2px", background: t.accent }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: t.accent,
            }}
          >
            Our Mission
          </span>
        </div>

        {/* Pull-quote layout */}
        <div style={{ display: "grid", gridTemplateColumns: "4px 1fr", gap: "36px" }}>
          <div
            style={{
              width: "4px",
              background: `linear-gradient(to bottom, ${t.accent}, transparent)`,
              borderRadius: "4px",
              minHeight: "100%",
            }}
          />
          <div>
            <h2
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 600,
                color: t.text,
                lineHeight: 1.25,
                letterSpacing: "-0.025em",
                margin: "0 0 32px 0",
              }}
            >
              Great events bring people together.
              <br />
              <span style={{ color: t.textMuted }}>We make that effortless.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: t.textSecondary,
                  margin: 0,
                }}
              >
                Whether it&apos;s a university conference, a startup meetup, a
                community workshop, or an online webinar — the experience of
                discovering, registering, and attending should be effortless.
                Evenza was built to make that happen.
              </p>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: t.textSecondary,
                  margin: 0,
                }}
              >
                We provide organizers with the tools to create professional
                events, manage attendees, and track analytics — while giving
                attendees a smooth way to discover events, purchase tickets,
                and check in with a QR code. One platform, the entire event
                lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────── */}
      <section
        id="capabilities"
        style={{
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "96px 48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ width: "28px", height: "2px", background: t.accent }} />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: t.accent,
                  }}
                >
                  Platform
                </span>
              </div>
              <h2
                style={{
                  fontFamily: t.serif,
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 600,
                  color: t.text,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Everything you need to run an event
              </h2>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: t.textMuted,
                maxWidth: "300px",
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              From the first registration to the final review — Evenza handles
              each step so you can focus on the experience.
            </p>
          </div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3"
            style={{ display: "grid", gap: "1px", background: t.borderLight }}
          >
            {capabilities.map((cap, i) => (
              <CapabilityCard key={i} cap={cap} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────── */}
      <section
        id="values"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "96px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "28px", height: "2px", background: t.accent }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: t.accent,
            }}
          >
            Values
          </span>
        </div>

        <h2
          style={{
            fontFamily: t.serif,
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 600,
            color: t.text,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            margin: "0 0 52px 0",
          }}
        >
          What we stand for
        </h2>

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ display: "grid", gap: "16px" }}
        >
          {values.map((val, i) => (
            <ValueCard key={i} val={val} index={i} />
          ))}
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────── */}
      <section
        style={{
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "80px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div style={{ width: "28px", height: "2px", background: t.accent }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: t.accent,
              }}
            >
              Technology
            </span>
          </div>

          <h2
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              fontWeight: 600,
              color: t.text,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              margin: "0 0 10px 0",
            }}
          >
            Built with modern tools
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: t.textMuted,
              margin: "0 0 36px 0",
              lineHeight: 1.65,
            }}
          >
            Battle-tested technologies that deliver a fast, reliable, and
            secure experience.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {techStack.map((tech) => (
              <TechPill key={tech.label} tech={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section
        style={{
          background: "#06060a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Left glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-80px",
            transform: "translateY(-50%)",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Right glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-80px",
            transform: "translateY(-50%)",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(99,91,255,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "720px",
            margin: "0 auto",
            padding: "110px 48px",
            textAlign: "center",
          }}
        >
          {/* Eyebrow badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              marginBottom: "28px",
            }}
          >
            <Sparkles
              style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.4)" }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
              }}
            >
              Start today, it&apos;s free
            </span>
          </div>

          <h2
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(1.7rem, 3.5vw, 2.75rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
              margin: "0 0 18px 0",
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.4)",
              maxWidth: "400px",
              margin: "0 auto 44px",
              lineHeight: 1.7,
            }}
          >
            Whether you&apos;re looking to attend events or organize your own,
            Evenza has you covered.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: t.sans,
                color: "#fff",
                background: t.accent,
                borderRadius: "6px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Browse Events
              <ArrowRight style={{ width: "15px", height: "15px" }} />
            </Link>
            <Link
              href="/sign-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: t.sans,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "6px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
