// app/(root)/privacy/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const t = {
  bg: "#fafaf8",
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
  body: "'Source Serif 4', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

const LAST_UPDATED = "March 15, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: t.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: t.dark, padding: "100px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: "32px", fontFamily: t.sans }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to Evenza
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "3px", background: t.accent, borderRadius: "2px" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", fontFamily: t.sans }}>Legal</span>
          </div>
          <h1 style={{ fontFamily: t.serif, fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", margin: 0, fontFamily: t.sans }}>
            Last updated {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 100px" }}>
        <div className="privacy-body" style={{ fontFamily: t.body, fontSize: "15px", lineHeight: 1.8, color: t.textSecondary }}>

          <Section n="01" title="What We Collect">
            <p>When you use Evenza, we collect:</p>
            <ul>
              <li><strong>Account data</strong> — name, email address, and profile photo, provided through Clerk authentication.</li>
              <li><strong>Profile data</strong> — phone number, bio, location, job title, and organization, which you add voluntarily.</li>
              <li><strong>Event data</strong> — registrations, ticket purchases, feedback, and check-in records.</li>
              <li><strong>Payment data</strong> — processed by Stripe. We store order amounts and status but never your card details.</li>
              <li><strong>Contact submissions</strong> — name, email, and message content from the contact form.</li>
            </ul>
          </Section>

          <Section n="02" title="How We Use It">
            <p>Your data is used to operate the platform: managing accounts, processing registrations, issuing tickets, handling payments, and enabling organizers to manage their events. We also use it to moderate content and respond to support requests. We do not use your data for advertising or sell it to third parties.</p>
          </Section>

          <Section n="03" title="Third-Party Services">
            <p>Evenza relies on the following services that may process your data under their own privacy policies:</p>
            <ul>
              <li><strong>Clerk</strong> — authentication and identity management.</li>
              <li><strong>Stripe</strong> — payment processing for paid events.</li>
              <li><strong>Vercel</strong> — hosting and deployment.</li>
              <li><strong>Neon / PostgreSQL</strong> — database storage.</li>
            </ul>
          </Section>

          <Section n="04" title="Data Sharing">
            <p>Organizers can see the name, email, and registration status of attendees who register for their events. This is necessary for event management. Organizers cannot see your payment card details, other events you attend, or your profile data beyond what you make visible.</p>
            <p>Administrators have access to all platform data for moderation and support purposes.</p>
          </Section>

          <Section n="05" title="Cookies & Sessions">
            <p>We use essential cookies for authentication sessions managed by Clerk. We do not use advertising cookies, tracking pixels, or analytics cookies. Your session data is stored securely and expires automatically.</p>
          </Section>

          <Section n="06" title="Your Rights">
            <p>You can:</p>
            <ul>
              <li>View and edit your profile data at any time from your profile page.</li>
              <li>Request a copy of all data we hold about you.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Cancel event registrations and withdraw feedback.</li>
            </ul>
            <p>To exercise these rights, contact us at <span style={{ color: t.accent, fontFamily: t.sans, fontWeight: 500 }}>support@evenza.app</span>.</p>
          </Section>

          <Section n="07" title="Data Retention">
            <p>Account data is retained for as long as your account is active. If you delete your account, personal data is removed within 30 days. Order and payment records may be retained longer for legal and financial compliance. Event data (titles, descriptions) created by organizers remains on the platform unless explicitly deleted.</p>
          </Section>

          <Section n="08" title="Contact">
            <p>For privacy-related questions or data requests:</p>
            <div style={{ background: t.borderLight, borderRadius: "6px", padding: "16px 20px", marginTop: "8px" }}>
              <p style={{ margin: 0, fontFamily: t.sans, fontSize: "13px", color: t.textMuted, lineHeight: 1.6 }}>
                Evenza · Al-Quds University ·, Palestine<br />
                <span style={{ color: t.accent, fontWeight: 500 }}>support@evenza.app</span>
              </p>
            </div>
          </Section>

        </div>

        {/* Footer link */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: `1px solid ${t.borderLight}`, display: "flex", gap: "24px", fontFamily: t.sans, fontSize: "13px" }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}>
            Terms of Service
          </Link>
          <Link href="/contact" style={{ color: t.textMuted, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}>
            Contact Us
          </Link>
        </div>
      </div>

      <style>{`
        .privacy-body p { margin: 0 0 16px; }
        .privacy-body p:last-child { margin-bottom: 0; }
        .privacy-body ul { margin: 8px 0 16px; padding-left: 24px; }
        .privacy-body ul li { margin-bottom: 6px; padding-left: 4px; }
        .privacy-body ul li::marker { color: ${t.accent}; }
        .privacy-body strong { font-weight: 600; color: ${t.text}; }
      `}</style>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 600, color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>{n}</span>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}