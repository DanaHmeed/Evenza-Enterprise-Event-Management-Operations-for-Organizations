// app/dashboard/settings/page.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { ExternalLink, User, Shield, Mail, ChevronRight } from "lucide-react";

// ── Color tokens (same as dashboard) ─────────────────────────────────────────
const c = {
  a50:"#FAEEDA", a100:"#FAC775", a200:"#EF9F27", a600:"#854F0B", a800:"#633806",
  g50:"#EAF3DE", g600:"#3B6D11", g800:"#27500A",
  c50:"#FAECE7", c100:"#F5C4B3", c600:"#993C1D",
  p50:"#EEEDFE", p600:"#534AB7", p800:"#3C3489",
  b50:"#E6F1FB", b600:"#185FA5",
  gr200:"#B4B2A9", gr400:"#888780",
} as const;

export default function OrganizerSettingsPage() {
  const { user }  = useUser();
  const { openUserProfile } = useClerk();

  // ── Section groups ─────────────────────────────────────────────────────────
  const sections = [
    {
      title: "Profile",
      items: [
        {
          label: "Edit profile",
          desc:  "Update your name, bio, phone, and professional details",
          icon:  <User  style={{ width: 16, height: 16 }} />,
          href:  "/profile",
          action: null,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Account security",
          desc:  "Password, two-factor authentication, and active sessions",
          icon:  <Shield style={{ width: 16, height: 16 }} />,
          href:  null,
          // Opens Clerk's built-in UserProfile modal on the Security tab
          action: () => openUserProfile({ appearance: { elements: { rootBox: { zIndex: 9999 } } } }),
        },
        {
          label: "Email addresses",
          desc:  "Add or remove email addresses linked to your account",
          icon:  <Mail  style={{ width: 16, height: 16 }} />,
          href:  null,
          // Opens Clerk's built-in UserProfile modal (default tab shows email)
          action: () => openUserProfile(),
        },
      ],
    },
  ];

  return (
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        paddingBottom: 18,
        borderBottom: "1px solid var(--color-border-tertiary,#e8e8e8)",
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
          color: "var(--color-text-primary,#111)",
        }}>Settings</div>
        <div style={{
          fontSize: 11, letterSpacing: "0.04em",
          color: "var(--color-text-tertiary,#999)", marginTop: 3,
        }}>Manage your account and preferences.</div>
      </div>

      {/* ── User card ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px", marginBottom: 24,
        border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
        borderRadius: 12,
      }}>
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt=""
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: c.a50, border: `0.5px solid ${c.a100}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 500, color: c.a600,
          }}>
            {user?.firstName?.[0]?.toUpperCase() || "O"}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500,
            color: "var(--color-text-primary,#111)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{user?.fullName || "Organizer"}</div>
          <div style={{
            fontSize: 11, letterSpacing: "0.02em",
            color: "var(--color-text-tertiary,#999)", marginTop: 2,
          }}>{user?.primaryEmailAddress?.emailAddress}</div>
        </div>
      </div>

      {/* ── Sections ────────────────────────────────────────────────────────── */}
      {sections.map(section => (
        <div key={section.title} style={{ marginBottom: 24 }}>
          {/* section label */}
          <div style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
            color: "var(--color-text-secondary,#666)",
            marginBottom: 8, paddingLeft: 2,
          }}>{section.title}</div>

          {/* items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {section.items.map((item, i) => {
              const inner = (
                <>
                  {/* icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "var(--color-background-secondary,#f5f5f5)",
                    border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-text-secondary,#666)",
                  }}>
                    {item.icon}
                  </div>

                  {/* text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      color: "var(--color-text-primary,#111)",
                    }}>{item.label}</div>
                    <div style={{
                      fontSize: 11, color: "var(--color-text-tertiary,#999)",
                      marginTop: 2, lineHeight: 1.45,
                    }}>{item.desc}</div>
                  </div>

                  {/* arrow / external */}
                  <ChevronRight style={{
                    width: 14, height: 14, flexShrink: 0,
                    color: "var(--color-text-tertiary,#999)",
                  }} />
                </>
              );

              const sharedStyle: React.CSSProperties = {
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                borderRadius: 12, textDecoration: "none",
                background: "var(--color-background-primary,#fff)",
                cursor: "pointer", width: "100%", textAlign: "left",
                transition: "background 0.12s",
              };

              // button (Clerk modal) vs Link (internal route)
              return item.action ? (
                <button
                  key={i}
                  onClick={item.action}
                  style={sharedStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-background-primary,#fff)")}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={i}
                  href={item.href!}
                  style={sharedStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--color-background-primary,#fff)")}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}