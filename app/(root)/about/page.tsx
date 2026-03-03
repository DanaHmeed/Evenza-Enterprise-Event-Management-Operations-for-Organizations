// app/(root)/about/page.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
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

/* ═══════════════════════════════════════════
   Design tokens — synced with events pages
   ═══════════════════════════════════════════ */
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
  green: "#2d6a4f",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */
const stats = [
  { value: "1,200+", label: "Events Created" },
  { value: "8,500+", label: "Registered Attendees" },
  { value: "50+", label: "Organizers" },
  { value: "12", label: "Event Categories" },
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
    icon: <Globe style={{ width: "20px", height: "20px" }} />,
    title: "Accessible to Everyone",
    desc: "No technical skill required. Universities, startups, and individual creators can publish events in minutes.",
  },
  {
    icon: <ShieldCheck style={{ width: "20px", height: "20px" }} />,
    title: "Secure & Trustworthy",
    desc: "Stripe payments, Clerk authentication, QR ticket verification, and admin moderation keep the platform safe.",
  },
  {
    icon: <Users style={{ width: "20px", height: "20px" }} />,
    title: "Community First",
    desc: "Built for the Palestinian community and beyond — designed for local organizers, built to scale globally.",
  },
  {
    icon: <Zap style={{ width: "20px", height: "20px" }} />,
    title: "End-to-End Solution",
    desc: "From event creation to check-in to post-event feedback — one platform handles the entire lifecycle.",
  },
  {
    icon: <Sparkles style={{ width: "20px", height: "20px" }} />,
    title: "Modern Experience",
    desc: "Responsive design, smooth transitions, real-time updates, and a clean interface built with the latest web technologies.",
  },
  {
    icon: <Heart style={{ width: "20px", height: "20px" }} />,
    title: "Made with Intention",
    desc: "Every feature was carefully designed and coded. This is more than a project — it's a platform we believe in.",
  },
];

const techStack = [
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
];

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {/* ─────────────────────────────────
          HERO
          ───────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#1a1a2e",
          padding: "120px 48px 100px",
        }}
      >
        {/* Subtle gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "30%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div style={{ width: "32px", height: "2px", background: t.accent }} />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: t.accent,
              }}
            >
              About Evenza
            </span>
          </div>

          <h1
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              margin: "0 0 24px 0",
            }}
          >
            Bringing people together
            <br />
            through live experiences
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.55)",
              maxWidth: "640px",
              margin: 0,
            }}
          >
            Evenza is a full-stack event management platform designed to connect
            organizers with attendees through a seamless, modern experience —
            from discovery and registration to check-in and feedback.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────
          STATS BAR
          ───────────────────────────────── */}
      <section
        style={{
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
          }}
          className="grid-cols-2 sm:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "40px 0",
                textAlign: "center",
                borderRight: i < stats.length - 1 ? `1px solid ${t.borderLight}` : "none",
              }}
            >
              <p
                style={{
                  fontFamily: t.serif,
                  fontSize: "32px",
                  fontWeight: 600,
                  color: t.text,
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────
          MISSION
          ───────────────────────────────── */}
      <section
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "96px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div style={{ width: "32px", height: "2px", background: t.accent }} />
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

        <h2
          style={{
            fontFamily: t.serif,
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 600,
            color: t.text,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            margin: "0 0 28px 0",
          }}
        >
          Great events bring people together.
          <br />
          We make that effortless.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.75,
              color: t.textSecondary,
              margin: 0,
            }}
          >
            Whether it&apos;s a university conference, a startup meetup, a community
            workshop, or an online webinar — the experience of discovering,
            registering, and attending should be effortless. Evenza was built to
            make that happen.
          </p>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.75,
              color: t.textSecondary,
              margin: 0,
            }}
          >
            We provide organizers with the tools to create professional events,
            manage attendees, and track analytics — while giving attendees a
            smooth way to discover events, purchase tickets, and check in with a
            QR code. One platform, the entire event lifecycle.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────
          WHAT EVENZA DOES (Capabilities)
          ───────────────────────────────── */}
      <section
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div style={{ width: "32px", height: "2px", background: t.accent }} />
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
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
            }}
          >
            Everything you need to run an event
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: t.textMuted,
              maxWidth: "520px",
              margin: "0 0 56px 0",
              lineHeight: 1.6,
            }}
          >
            From the first registration to the final review — Evenza handles
            each step so you can focus on the experience.
          </p>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3"
            style={{ display: "grid", gap: "1px", background: t.borderLight }}
          >
            {capabilities.map((cap, i) => (
              <div
                key={i}
                style={{
                  background: t.surface,
                  padding: "36px 32px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.accentSoft,
                    borderRadius: "6px",
                    color: t.accent,
                    marginBottom: "20px",
                  }}
                >
                  {cap.icon}
                </div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: t.text,
                    margin: "0 0 8px 0",
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: t.textMuted,
                    margin: 0,
                  }}
                >
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────
          VALUES
          ───────────────────────────────── */}
      <section
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
            marginBottom: "24px",
          }}
        >
          <div style={{ width: "32px", height: "2px", background: t.accent }} />
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
            margin: "0 0 56px 0",
          }}
        >
          What we stand for
        </h2>

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ display: "grid", gap: "40px 48px" }}
        >
          {values.map((val, i) => (
            <div key={i}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.accent,
                  marginBottom: "16px",
                }}
              >
                {val.icon}
              </div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: t.text,
                  margin: "0 0 8px 0",
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
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────
          TECH STACK
          ───────────────────────────────── */}
      <section
        style={{
          background: t.surface,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "80px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div style={{ width: "32px", height: "2px", background: t.accent }} />
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
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 600,
              color: t.text,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              margin: "0 0 12px 0",
            }}
          >
            Built with modern tools
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: t.textMuted,
              margin: "0 0 32px 0",
              lineHeight: 1.6,
            }}
          >
            Evenza uses battle-tested technologies to deliver a fast, reliable,
            and secure experience.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {techStack.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: t.textSecondary,
                  background: t.bg,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: "4px",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────
          CTA
          ───────────────────────────────── */}
      <section
        style={{
          background: "#1a1a2e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "96px 48px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "440px",
              margin: "0 auto 40px",
              lineHeight: 1.6,
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
              gap: "14px",
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
                borderRadius: "4px",
                textDecoration: "none",
                transition: "opacity 0.2s",
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
                color: "rgba(255,255,255,0.75)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "4px",
                textDecoration: "none",
                transition: "border-color 0.2s",
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