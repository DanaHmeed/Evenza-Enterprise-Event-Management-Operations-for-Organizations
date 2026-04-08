// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  MessageSquare,
  CreditCard,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Design tokens — orange accent for organizer
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fff",
  bgHover: "#fafaf8",
  bgActive: "#fff7ed",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#bbb",
  accent: "#ea580c",
  accentSoft: "rgba(234,88,12,0.08)",
  sans: "'DM Sans', sans-serif",
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const iconSize = { width: "20px", height: "20px" };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard style={iconSize} /> },
    ],
  },
  {
    title: "Events",
    items: [
      { label: "My Events", href: "/dashboard/events", icon: <CalendarDays style={iconSize} /> },
      { label: "Create Event", href: "/dashboard/events/create", icon: <CalendarPlus style={iconSize} /> },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Attendees", href: "/dashboard/attendees", icon: <Users style={iconSize} /> },
      { label: "Revenue", href: "/dashboard/revenue", icon: <CreditCard style={iconSize} /> },
      { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 style={iconSize} /> },
      { label: "Feedback", href: "/dashboard/feedback", icon: <MessageSquare style={iconSize} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: <Settings style={iconSize} /> },
    ],
  },
];

function NavContent({
  collapsed,
  setCollapsed,
  isActive,
  user,
  onNavigate,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isActive: (href: string) => boolean;
  user: { imageUrl?: string; firstName?: string | null; fullName?: string | null } | null | undefined;
  onNavigate?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: t.sans,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "64px",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: `1px solid ${t.borderLight}`,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <div
            onClick={() => setCollapsed(false)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <img
              src="/icons/Logomark.png"
              alt="Evenza"
              style={{ height: "22px", width: "auto" }}
            />
          </div>
        ) : (
          <>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <img
                src="/icons/Logomark.png"
                alt="Evenza"
                style={{ height: "22px", width: "auto" }}
              />
              <img
                src="/icons/text.png"
                alt="Evenza"
                style={{ height: "16px", width: "auto" }}
              />
            </Link>

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                border: "none",
                background: "transparent",
                color: t.textFaint,
                cursor: "pointer",
              }}
            >
              <ChevronLeft style={{ width: "16px", height: "16px" }} />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed ? "16px 8px" : "16px 12px",
        }}
      >
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: "24px" }}>
            {!collapsed && (
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: t.textFaint,
                  padding: "0 10px",
                  margin: "0 0 8px 0",
                }}
              >
                {group.title}
              </p>
            )}

            {collapsed && gi > 0 && (
              <div
                style={{
                  height: "1px",
                  background: t.borderLight,
                  margin: "0 4px 12px",
                }}
              />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: "12px",
                      padding: collapsed ? "10px" : "9px 12px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: active ? 600 : 500,
                      fontFamily: t.sans,
                      color: active ? t.accent : t.textSecondary,
                      background: active ? t.accentSoft : "transparent",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = t.bgHover;
                        e.currentTarget.style.color = t.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = t.textSecondary;
                      }
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        flexShrink: 0,
                        color: active ? t.accent : t.textMuted,
                      }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              color: "#fff",
                              background: t.accent,
                              padding: "1px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div
        style={{
          borderTop: `1px solid ${t.borderLight}`,
          padding: collapsed ? "16px 8px" : "16px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: t.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: t.accent }}>
                {user?.firstName?.[0] || "O"}
              </span>
            </div>
          )}
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: t.text,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullName || "Organizer"}
              </p>
              <p style={{ fontSize: "11px", color: t.textMuted, margin: "1px 0 0" }}>
                Event Organizer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {}, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/events")
      return (
        pathname === "/dashboard/events" ||
        (pathname.startsWith("/dashboard/events/") && !pathname.includes("create"))
      );
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex"
        style={{
          flexDirection: "column",
          width: collapsed ? "68px" : "256px",
          background: t.bg,
          borderRight: `1px solid ${t.borderLight}`,
          transition: "width 0.2s ease",
          position: "relative",
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        <NavContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isActive={isActive}
          user={user}
        />
      </aside>
    </>
  );
}