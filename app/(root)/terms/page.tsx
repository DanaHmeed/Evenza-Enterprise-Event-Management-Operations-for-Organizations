// app/(root)/terms/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

const t = {
  bg: "#fafaf8",
  surface: "#fff",
  dark: "#0f0f14",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#444",
  textMuted: "#777",
  textFaint: "#aaa",
  accent: "#ea580c",
  accentSoft: "rgba(234,88,12,0.07)",
  serif: "'Playfair Display', Georgia, serif",
  body: "'Source Serif 4', 'Georgia', serif",
  sans: "'DM Sans', sans-serif",
};

const LAST_UPDATED = "March 15, 2026";

interface Section {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sections: Section[] = [
    {
      id: "intro",
      number: "01",
      title: "Introduction",
      content: (
        <>
          <p>
            Welcome to Evenza (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). Evenza is an event management platform developed as a graduation project at An-Najah National University, Nablus, Palestine. By accessing or using our platform at evenza.app, you agree to be bound by these Terms of Service.
          </p>
          <p>
            If you do not agree with any part of these terms, you must not use the Platform. We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance of the revised terms.
          </p>
        </>
      ),
    },
    {
      id: "definitions",
      number: "02",
      title: "Definitions",
      content: (
        <>
          <p>Throughout these Terms, the following definitions apply:</p>
          <dl>
            <dt>&ldquo;User&rdquo;</dt>
            <dd>Any individual who creates an account on the Platform, whether as an attendee, organizer, or administrator.</dd>
            <dt>&ldquo;Organizer&rdquo;</dt>
            <dd>A User who creates, manages, and publishes events on the Platform.</dd>
            <dt>&ldquo;Attendee&rdquo;</dt>
            <dd>A User who registers for, purchases tickets to, or attends events listed on the Platform.</dd>
            <dt>&ldquo;Event&rdquo;</dt>
            <dd>Any gathering, workshop, conference, meetup, or activity listed on the Platform by an Organizer.</dd>
            <dt>&ldquo;Content&rdquo;</dt>
            <dd>All text, images, descriptions, feedback, reviews, and other materials submitted to the Platform.</dd>
          </dl>
        </>
      ),
    },
    {
      id: "eligibility",
      number: "03",
      title: "Eligibility & Accounts",
      content: (
        <>
          <p>
            You must be at least 16 years of age to create an account on Evenza. By registering, you represent that you are of legal age to form a binding contract in your jurisdiction.
          </p>
          <p>
            Accounts are created and authenticated through Clerk, our identity provider. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or are inactive for an extended period. Organizer accounts require approval and may be subject to additional verification.
          </p>
        </>
      ),
    },
    {
      id: "organizer-obligations",
      number: "04",
      title: "Organizer Obligations",
      content: (
        <>
          <p>
            As an Organizer on Evenza, you agree to the following:
          </p>
          <ul>
            <li>Provide accurate and truthful information about your events, including dates, locations, pricing, and descriptions.</li>
            <li>Fulfill all commitments made to Attendees, including delivering the event as described.</li>
            <li>Comply with all applicable local laws and regulations in Palestine and any other jurisdiction where your event takes place.</li>
            <li>Respond to Attendee inquiries in a timely manner.</li>
            <li>Not use the Platform to promote illegal activities, hate speech, discrimination, or content that violates Palestinian law.</li>
          </ul>
          <p>
            Evenza reserves the right to remove, unpublish, or cancel any event that violates these obligations without prior notice.
          </p>
        </>
      ),
    },
    {
      id: "attendee-obligations",
      number: "05",
      title: "Attendee Obligations",
      content: (
        <>
          <p>As an Attendee, you agree to:</p>
          <ul>
            <li>Provide accurate personal information during registration.</li>
            <li>Honor your event registrations and notify Organizers if you can no longer attend.</li>
            <li>Not transfer, resell, or duplicate tickets unless explicitly permitted by the Organizer.</li>
            <li>Submit honest and constructive feedback. Reviews that contain defamation, hate speech, or false claims may be removed.</li>
            <li>Respect the Organizer&rsquo;s event rules and venue policies.</li>
          </ul>
        </>
      ),
    },
    {
      id: "payments",
      number: "06",
      title: "Payments & Refunds",
      content: (
        <>
          <p>
            Evenza supports multiple payment methods including Stripe (credit/debit cards), bank transfers, cash payments, and Jawwal Pay. All online payments are processed securely through Stripe&rsquo;s payment infrastructure.
          </p>
          <p>
            <strong>Pricing.</strong> Event pricing is set by Organizers. Evenza does not control or guarantee the pricing of any event. All prices are displayed in the currency specified by the Organizer.
          </p>
          <p>
            <strong>Refunds.</strong> Refund policies are determined by individual Organizers. If an Organizer cancels an event, Attendees who paid via Stripe will receive an automatic refund. For other payment methods, the Organizer is responsible for processing refunds directly.
          </p>
          <p>
            <strong>Platform fees.</strong> Evenza is currently free to use as part of its graduation project phase. Future pricing changes will be communicated with at least 30 days advance notice.
          </p>
        </>
      ),
    },
    {
      id: "content",
      number: "07",
      title: "Content & Intellectual Property",
      content: (
        <>
          <p>
            You retain ownership of all Content you submit to the Platform. By submitting Content, you grant Evenza a non-exclusive, worldwide, royalty-free license to use, display, and distribute your Content solely for the purpose of operating and promoting the Platform.
          </p>
          <p>
            You represent that you have the right to submit all Content and that your Content does not infringe on any third party&rsquo;s intellectual property rights.
          </p>
          <p>
            Evenza&rsquo;s name, logo, design system, and platform code are the intellectual property of the Evenza project team and may not be reproduced without permission.
          </p>
        </>
      ),
    },
    {
      id: "privacy",
      number: "08",
      title: "Privacy & Data",
      content: (
        <>
          <p>
            We collect personal information necessary to operate the Platform, including your name, email address, phone number, and payment details. Authentication data is managed by Clerk and is subject to their privacy policy.
          </p>
          <p>
            We do not sell your personal data to third parties. Data is stored securely on PostgreSQL databases and is accessible only to authorized administrators. Organizers can access Attendee data (name, email, registration status) for their own events only.
          </p>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data by contacting us at support@evenza.app.
          </p>
        </>
      ),
    },
    {
      id: "moderation",
      number: "09",
      title: "Moderation & Enforcement",
      content: (
        <>
          <p>
            Evenza employs a moderation system for user-generated content including event listings and feedback reviews. All feedback is subject to admin approval before being publicly visible.
          </p>
          <p>
            We reserve the right to, without prior notice:
          </p>
          <ul>
            <li>Remove or edit Content that violates these terms.</li>
            <li>Suspend or terminate User accounts.</li>
            <li>Cancel or unpublish events that are misleading, fraudulent, or illegal.</li>
            <li>Restrict access to certain features of the Platform.</li>
          </ul>
          <p>
            All moderation actions are logged in our audit system for transparency and accountability.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      number: "10",
      title: "Limitation of Liability",
      content: (
        <>
          <p>
            Evenza is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We make no warranties, express or implied, regarding the Platform&rsquo;s reliability, accuracy, or fitness for a particular purpose.
          </p>
          <p>
            Evenza acts as a platform connecting Organizers and Attendees. We are not responsible for the quality, safety, legality, or any other aspect of the events listed. The relationship between Organizer and Attendee is solely between those parties.
          </p>
          <p>
            To the fullest extent permitted by law, Evenza shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the Platform.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      number: "11",
      title: "Governing Law",
      content: (
        <>
          <p>
            These Terms shall be governed by and construed in accordance with the laws applicable in Palestine. Any disputes arising from these terms or use of the Platform shall be resolved through good-faith negotiation first, and if necessary, through the competent courts in Nablus, Palestine.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      number: "12",
      title: "Contact Information",
      content: (
        <>
          <p>
            For questions, concerns, or requests regarding these Terms of Service, please contact us:
          </p>
          <div style={{ background: t.borderLight, borderRadius: "6px", padding: "20px 24px", marginTop: "12px" }}>
            <p style={{ margin: "0 0 4px", fontFamily: t.sans, fontSize: "14px", fontWeight: 600, color: t.text }}>Evenza Platform</p>
            <p style={{ margin: "0 0 2px", fontFamily: t.sans, fontSize: "13px", color: t.textMuted }}>An-Najah National University</p>
            <p style={{ margin: "0 0 2px", fontFamily: t.sans, fontSize: "13px", color: t.textMuted }}>Nablus, Palestine</p>
            <p style={{ margin: "8px 0 0", fontFamily: t.sans, fontSize: "13px", color: t.accent, fontWeight: 500 }}>support@evenza.app</p>
          </div>
        </>
      ),
    },
  ];

  // Scroll tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the one closest to top
          const top = visible.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          );
          setActiveSection(top.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: t.bg, minHeight: "100vh" }}>
      {/* ── Dark header ── */}
      <div
        style={{
          background: t.dark,
          padding: "100px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow */}
        <div style={{ position: "absolute", top: "20%", left: "60%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: "32px", fontFamily: t.sans }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Back to Evenza
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "3px", background: t.accent, borderRadius: "2px" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", fontFamily: t.sans }}>
              Legal
            </span>
          </div>

          <h1
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Terms of Service
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", margin: 0, fontFamily: t.sans }}>
            Last updated {LAST_UPDATED} · Effective immediately
          </p>
        </div>
      </div>

      {/* ── Content area ── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "48px 24px 100px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "48px",
        }}
        className="grid-cols-1 lg:grid-cols-none"
      >
        {/* Sticky TOC */}
        <nav
          style={{
            position: "sticky",
            top: "100px",
            alignSelf: "start",
            maxHeight: "calc(100vh - 140px)",
            overflowY: "auto",
          }}
          className="hidden lg:block"
        >
          <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: t.textFaint, marginBottom: "16px", fontFamily: t.sans }}>
            Contents
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {sections.map((s) => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "none",
                    background: active ? t.accentSoft : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: t.sans,
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: "10px", fontWeight: 600, color: active ? t.accent : t.textFaint, fontVariantNumeric: "tabular-nums", minWidth: "18px" }}>
                    {s.number}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: active ? 600 : 400, color: active ? t.accent : t.textMuted, lineHeight: 1.3 }}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sections */}
        <div>
          {/* Intro note */}
          <div style={{ padding: "20px 24px", background: t.accentSoft, borderRadius: "6px", borderLeft: `3px solid ${t.accent}`, marginBottom: "40px" }}>
            <p style={{ fontSize: "13px", lineHeight: 1.6, color: t.textSecondary, margin: 0, fontFamily: t.sans }}>
              Please read these terms carefully. By using Evenza, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Evenza.
            </p>
          </div>

          {sections.map((section, i) => (
            <article
              key={section.id}
              id={section.id}
              style={{
                marginBottom: "48px",
                scrollMarginTop: "100px",
              }}
            >
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
                <span
                  style={{
                    fontFamily: t.sans,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: t.accent,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {section.number}
                </span>
                <h2
                  style={{
                    fontFamily: t.serif,
                    fontSize: "22px",
                    fontWeight: 600,
                    color: t.text,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {section.title}
                </h2>
              </div>

              {/* Section body — legal text styling */}
              <div
                style={{
                  fontFamily: t.body,
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: t.textSecondary,
                }}
                className="terms-body"
              >
                {section.content}
              </div>

              {/* Divider */}
              {i < sections.length - 1 && (
                <div style={{ height: "1px", background: t.borderLight, marginTop: "48px" }} />
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Inline styles for legal text elements */}
      <style>{`
        .terms-body p {
          margin: 0 0 16px;
        }
        .terms-body p:last-child {
          margin-bottom: 0;
        }
        .terms-body ul {
          margin: 12px 0 16px;
          padding-left: 24px;
        }
        .terms-body ul li {
          margin-bottom: 8px;
          padding-left: 4px;
        }
        .terms-body ul li::marker {
          color: ${t.accent};
        }
        .terms-body dl {
          margin: 16px 0;
        }
        .terms-body dt {
          font-family: ${t.sans};
          font-weight: 600;
          font-size: 13px;
          color: ${t.text};
          margin-bottom: 4px;
          margin-top: 16px;
        }
        .terms-body dt:first-child {
          margin-top: 0;
        }
        .terms-body dd {
          margin: 0 0 0 0;
          padding-left: 16px;
          border-left: 2px solid ${t.borderLight};
          font-size: 14px;
          color: ${t.textMuted};
        }
        .terms-body strong {
          font-weight: 600;
          color: ${t.text};
        }
        @media (max-width: 1023px) {
          .terms-body {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}