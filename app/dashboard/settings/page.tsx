// app/dashboard/settings/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Settings, ExternalLink, User, Shield, Mail } from "lucide-react";
import { t, SectionTitle } from "@/components/dashboard/OrganizerUI";

export default function OrganizerSettingsPage() {
  const { user } = useUser();

  const links = [
    {
      title: "Edit Profile",
      desc: "Update your name, bio, phone, and professional details",
      href: "/profile",
      icon: <User style={{ width: "18px", height: "18px" }} />,
    },
    {
      title: "Account Security",
      desc: "Manage your password, two-factor authentication, and sessions",
      href: "https://accounts.clerk.dev/user/security",
      icon: <Shield style={{ width: "18px", height: "18px" }} />,
      external: true,
    },
    {
      title: "Email Addresses",
      desc: "Add or change your email addresses",
      href: "https://accounts.clerk.dev/user",
      icon: <Mail style={{ width: "18px", height: "18px" }} />,
      external: true,
    },
  ];

  return (
    <div style={{ fontFamily: t.sans, maxWidth: "640px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Manage your account and preferences.</p>
      </div>

      {/* Current user info */}
      <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", padding: "24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: t.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px", fontWeight: 600, color: t.accent }}>
            {user?.firstName?.[0] || "O"}
          </div>
        )}
        <div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: 0 }}>{user?.fullName || "Organizer"}</p>
          <p style={{ fontSize: "13px", color: t.textMuted, margin: "2px 0 0" }}>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <SectionTitle title="Account" />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
              background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px",
              textDecoration: "none", transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.border)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.borderLight)}
          >
            <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, flexShrink: 0 }}>
              {link.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>{link.title}</p>
              <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>{link.desc}</p>
            </div>
            {link.external && <ExternalLink style={{ width: "14px", height: "14px", color: t.textFaint, flexShrink: 0 }} />}
          </Link>
        ))}
      </div>
    </div>
  );
}