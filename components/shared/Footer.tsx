"use client";

import Link from "next/link";

const t = {
  bg:           "#ffffff",
  border:       "#e8e8e4",
  borderLight:  "#f0f0ec",
  text:         "#111111",
  textSecondary:"#555555",
  textMuted:    "#999999",
  sans:         "'DM Sans', sans-serif",
};

const footerLinks = {
  Platform: [
    { label: "Browse Events",    href: "/events" },
    { label: "Create an Event",  href: "/sign-up" },
    { label: "How It Works",     href: "/#how-it-works" },
    { label: "For Organizers",   href: "/#workflow" },
  ],
  Company: [
    { label: "About",            href: "/about" },
    { label: "Contact",          href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy",   href: "/privacy" },
  ],
  Support: [
    { label: "Help Center",      href: "/contact/#help" },
    { label: "Report an Issue",  href: "/contact" },
    { label: "FAQs",             href: "/#faq" },
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
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
            gap: "48px",
            paddingBottom: "56px",
            borderBottom: `1px solid ${t.borderLight}`,
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginBottom: "20px",
                textDecoration: "none",
                fontSize: "22px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: t.text,
              }}
            >
              Evenza
            </Link>

            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.75,
                color: t.textMuted,
                fontWeight: 300,
                maxWidth: "300px",
                margin: "0 0 32px",
              }}
            >
              The all-in-one platform for creating, managing, and attending
              professional events.
            </p>

            <a
              href="mailto:support@evenza.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: t.textSecondary,
                textDecoration: "none",
                borderBottom: `1px solid ${t.border}`,
                paddingBottom: "2px",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = t.text;
                e.currentTarget.style.borderColor = t.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = t.textSecondary;
                e.currentTarget.style.borderColor = t.border;
              }}
            >
              support@evenza.com
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: t.text,
                  margin: "0 0 22px",
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
                  gap: "13px",
                }}
              >
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: "14px",
                        fontWeight: 300,
                        color: t.textMuted,
                        textDecoration: "none",
                        transition: "color 0.18s",
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

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            padding: "22px 0 28px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 300, color: t.textMuted, margin: 0 }}>
            &copy; {currentYear} Evenza. All rights reserved.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms"   },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontSize: "12px",
                  fontWeight: 300,
                  color: t.textMuted,
                  textDecoration: "none",
                  transition: "color 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = t.textMuted)
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}