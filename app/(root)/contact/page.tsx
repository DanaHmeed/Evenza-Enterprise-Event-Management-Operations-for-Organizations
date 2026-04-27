// app/(root)/contact/page.tsx
"use client";

import { useState } from "react";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  Globe,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════
   Design tokens — synced across all pages
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#020202",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  greenBorder: "rgba(45,106,79,0.15)",
  dark: "#1a1a2e",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

const contactInfo = [
  {
    icon: <Mail style={{ width: "18px", height: "18px" }} />,
    label: "Email",
    value: "support@evenza.com",
    href: "mailto:support@evenza.com",
  },
  {
    icon: <MapPin style={{ width: "18px", height: "18px" }} />,
    label: "Location",
    value: "Palestine",
    href: null,
  },
  {
    icon: <Globe style={{ width: "18px", height: "18px" }} />,
    label: "Website",
    value: "www.evenza.com",
    href: "/",
  },
  {
    icon: <Clock style={{ width: "18px", height: "18px" }} />,
    label: "Response Time",
    value: "Within 24 hours · Sun–Thu, 9AM–5PM",
    href: null,
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (fields: { name: string; email: string; subject: string; message: string }) => {
    const errs: Record<string, string> = {};
    if (!fields.name.trim()) errs.name = "Name is required";
    if (!fields.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!fields.subject.trim()) errs.subject = "Subject is required";
    if (!fields.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleBlur = (field: string) => {
    setFocusedField(null);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate({ name, email, subject, message });
    setErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);
    const errs = validate({ name, email, subject, message });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    // Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
    setSubmitting(false);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrors({});
    setTouched({});
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: t.sans,
    color: t.text,
    background: t.bg,
    border: `1px solid ${touched[field] && errors[field] ? t.accent : focusedField === field ? t.text : t.border}`,
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.2s ease",
  });

  const errorMsg = (field: string) =>
    touched[field] && errors[field] ? (
      <p style={{ margin: "6px 0 0", fontSize: "12px", color: t.accent }}>
        {errors[field]}
      </p>
    ) : null;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: t.textSecondary,
    marginBottom: "8px",
  };

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      <style>{`
        .contact-input::placeholder { color: #777; }
      `}</style>
      {/* ─────────────────────────────────
          HERO — Split layout
          ───────────────────────────────── */}
      <section
        style={{
          background: "#06060a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "20%",
            transform: "translate(-50%, -50%)",
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "120px 48px 100px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "end",
          }}
          className="lg:grid-cols-2 grid-cols-1"
        >
          {/* Left — heading */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{ width: "32px", height: "2px", background: t.accent }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: t.accent,
                }}
              >
                Contact
              </span>
            </div>

            <h1
              style={{
                fontFamily: t.serif,
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                fontWeight: 600,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                margin: "0 0 20px 0",
              }}
            >
              Let&apos;s start a
              <br />
              conversation
            </h1>

            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "400px",
                margin: 0,
              }}
            >
              Have a question, idea, or want to collaborate? We&apos;re here and
              we&apos;d love to hear from you.
            </p>
          </div>

          {/* Right — contact details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            {contactInfo.map((info, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  padding: "20px 0",
                  borderTop:
                    i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.05)",
                    color: t.accent,
                    flexShrink: 0,
                  }}
                >
                  {info.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.3)",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {info.label}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.8)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.8)",
                        margin: 0,
                      }}
                    >
                      {info.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────
          FORM SECTION
          ───────────────────────────────── */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "80px 48px 120px",
        }}
      >
        {submitted ? (
          /* ── Success state ── */
          <div
            style={{
              textAlign: "center",
              padding: "80px 40px",
              background: t.surface,
              border: `1px solid ${t.greenBorder}`,
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: t.greenSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle2
                style={{ width: "24px", height: "24px", color: t.green }}
              />
            </div>
            <h3
              style={{
                fontFamily: t.serif,
                fontSize: "22px",
                fontWeight: 600,
                color: t.text,
                margin: "0 0 8px 0",
              }}
            >
              Message sent
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: t.textMuted,
                margin: "0 0 28px 0",
                lineHeight: 1.6,
              }}
            >
              Thank you for reaching out. We&apos;ll get back to you within 24
              hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: t.sans,
                color: t.accent,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Send another message
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div>
            {/* Section header */}
            <div style={{ marginBottom: "48px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "2px",
                    background: t.accent,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: t.accent,
                  }}
                >
                  Send a Message
                </span>
              </div>
              <h2
                id="help"
                style={{
                  fontFamily: t.serif,
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 600,
                  color: t.text,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  margin: "0 0 10px 0",
                }}
              >
                How can we help?
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: t.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Fill out the form below and we&apos;ll be in touch.
              </p>
            </div>

            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "6px",
                padding: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Name + Email row */}
                <div
                  className="grid sm:grid-cols-2 grid-cols-1"
                  style={{ display: "grid", gap: "24px" }}
                >
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => handleBlur("name")}
                      placeholder="Your name"
                      className="contact-input"
                      style={inputStyle("name")}
                    />
                    {errorMsg("name")}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@example.com"
                      className="contact-input"
                      style={inputStyle("email")}
                    />
                    {errorMsg("email")}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onFocus={() => setFocusedField("subject")}
                    onBlur={() => handleBlur("subject")}
                    placeholder="What is this about?"
                    className="contact-input"
                    style={inputStyle("subject")}
                  />
                  {errorMsg("subject")}
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => handleBlur("message")}
                    placeholder="Tell us more about your question or request..."
                    rows={6}
                    className="contact-input"
                    style={{
                      ...inputStyle("message"),
                      resize: "none" as const,
                    }}
                  />
                  {errorMsg("message")}
                </div>

                {/* Submit */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    paddingTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "13px 32px",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: t.sans,
                      color: "#fff",
                      background: t.text,
                      border: "none",
                      borderRadius: "4px",
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.6 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {submitting ? (
                      <Loader2
                        className="animate-spin"
                        style={{ width: "16px", height: "16px" }}
                      />
                    ) : (
                      <Send style={{ width: "14px", height: "14px" }} />
                    )}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>

                  <p
                    style={{
                      fontSize: "12px",
                      color: t.textFaint,
                      margin: 0,
                    }}
                  >
                    We&apos;ll respond within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────
          BOTTOM CTA — Explore events
          ───────────────────────────────── */}
      <section
        style={{
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "64px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: t.serif,
                fontSize: "20px",
                fontWeight: 600,
                color: t.text,
                margin: "0 0 6px 0",
              }}
            >
              Not sure what you need?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: t.textMuted,
                margin: 0,
              }}
            >
              Browse our events to see what Evenza can do, or check the about
              page to learn more.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: t.sans,
                color: "#fff",
                background: t.accent,
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              Browse Events
              <ArrowRight style={{ width: "14px", height: "14px" }} />
            </Link>
            <Link
              href="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: t.sans,
                color: t.textSecondary,
                background: "transparent",
                border: `1px solid ${t.border}`,
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              About Evenza
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
