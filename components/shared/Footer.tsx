// components/shared/Footer.tsx
"use client";

import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const t = {
  bg: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#444",
  textMuted: "#777",
  accent: "#e63946",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

const footerLinks = {
  Platform: [
    { label: "Browse Events", href: "/events" },
    { label: "Create an Event", href: "/sign-up" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Organizers", href: "/#worflow" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Support: [
    { label: "Help Center", href: "/contact/#help" },
    { label: "Report an Issue", href: "/contact" },
    { label: "FAQs", href: "/#faq" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: t.bg,
        fontFamily: t.sans,
        width: "100%",
        borderTop: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "64px 48px 0",
        }}
      >
        {/* ── Main grid ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12"
          style={{
            display: "grid",
            gap: "48px",
            paddingBottom: "56px",
          }}
        >
          {/* Brand column */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginBottom: "18px",
                textDecoration: "none",
              }}
            >
              <img
                src="/icons/logo.png"
                alt="Evenza"
                style={{
                  height: "36px",
                  width: "auto",
                  display: "block",
                }}
              />
            </Link>

            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: t.textMuted,
                maxWidth: "360px",
                margin: "0 0 28px 0",
              }}
            >
              The all-in-one platform for creating, managing, and attending
              professional events. Built for organizers, loved by attendees.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <a
                href="mailto:support@evenza.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: t.textSecondary,
                  textDecoration: "none",
                }}
              >
                <Mail
                  style={{
                    width: "15px",
                    height: "15px",
                    color: t.textMuted,
                  }}
                />
                support@evenza.com
              </a>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: t.textSecondary,
                }}
              >
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div
              key={heading}
              className="lg:col-span-2"
              style={{ minWidth: 0 }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: t.text,
                  margin: "0 0 20px 0",
                }}
              >
                {heading}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        color: t.textMuted,
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = t.text)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = t.textMuted)
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: "1px", background: t.borderLight }} />

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            padding: "24px 0",
          }}
        >
          <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>
            &copy; {currentYear} Evenza. All rights reserved.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}
          >
            <Link
              href="/privacy"
              style={{
                fontSize: "13px",
                color: t.textMuted,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textMuted)
              }
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{
                fontSize: "13px",
                color: t.textMuted,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textMuted)
              }
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}