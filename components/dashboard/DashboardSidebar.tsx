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
   Design tokens — neutral, minimal
   ═══════════════════════════════════════════ */
const t = {
  bg:           "#ffffff",
  bgHover:      "#fafaf8ee",
  bgActive:     "#f5f5f3",
  border:       "#e8e8e4",
  borderLight:  "#f0f0ec",
  text:         "#111111",
  textSecondary:"#212020",
  textMuted:    "#bbbbbb",
  sans:         "'DM Sans', sans-serif",
};

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const iconSize = { width: "16px", height: "16px", strokeWidth: "1.6" };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard",    href: "/dashboard",                 icon: <LayoutDashboard style={iconSize} /> },
    ],
  },
  {
    title: "Events",
    items: [
      { label: "My Events",    href: "/dashboard/events",          icon: <CalendarDays    style={iconSize} /> },
      { label: "Create Event", href: "/dashboard/events/create",   icon: <CalendarPlus    style={iconSize} /> },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Attendees",    href: "/dashboard/attendees",       icon: <Users           style={iconSize} /> },
      { label: "Revenue",      href: "/dashboard/revenue",         icon: <CreditCard      style={iconSize} /> },
      { label: "Analytics",    href: "/dashboard/analytics",       icon: <BarChart3       style={iconSize} /> },
      { label: "Feedback",     href: "/dashboard/feedback",        icon: <MessageSquare   style={iconSize} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings",     href: "/dashboard/settings",        icon: <Settings        style={iconSize} /> },
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
  collapsed:    boolean;
  setCollapsed: (v: boolean) => void;
  isActive:     (href: string) => boolean;
  user:         { imageUrl?: string; firstName?: string | null; fullName?: string | null } | null | undefined;
  onNavigate?:  () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: t.sans }}>

      {/* ── Logo ── */}
      <div
        style={{
          height: "60px",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: `1px solid ${t.borderLight}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <div
            onClick={() => setCollapsed(false)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <img src="/icons/Logomark.png" alt="Evenza" style={{ height: "20px", width: "auto" }} />
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
                fontSize: "16px",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: t.text,
                flexShrink: 0,
              }}
            >
              <img src="/icons/Logomark.png" alt="" style={{ height: "20px", width: "auto" }} />
              Evenza
            </Link>

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setCollapsed(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "26px",
                height: "26px",
                borderRadius: "5px",
                border: "none",
                background: "transparent",
                color: t.textMuted,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.bgActive;
                e.currentTarget.style.color = "#888";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.textMuted;
              }}
            >
              <ChevronLeft style={{ width: "14px", height: "14px" }} />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed ? "16px 8px" : "16px 10px",
        }}
      >
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: "24px" }}>

            {!collapsed && (
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: t.textMuted,
                  padding: "0 10px",
                  margin: "0 0 6px",
                }}
              >
                {group.title}
              </p>
            )}

            {collapsed && gi > 0 && (
              <div style={{ height: "1px", background: t.borderLight, margin: "0 4px 12px" }} />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
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
                      gap: "10px",
                      padding: collapsed ? "10px" : "8px 10px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "13.5px",
                      fontWeight: active ? 500 : 400,
                      color: active ? t.text : t.textSecondary,
                      background: active ? t.bgActive : "transparent",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = t.bgHover;
                        e.currentTarget.style.color = "#333";
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
                        color: active ? t.text : t.textMuted,
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
                              fontWeight: 500,
                              color: t.text,
                              background: t.bgActive,
                              border: `1px solid ${t.border}`,
                              padding: "1px 7px",
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
          padding: collapsed ? "14px 8px" : "14px 16px",
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
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: t.borderLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#888" }}>
                {user?.firstName?.[0] || "O"}
              </span>
            </div>
          )}

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: t.text,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullName || "Organizer"}
              </p>
              <p style={{ fontSize: "11px", fontWeight: 300, color: t.textMuted, margin: "1px 0 0" }}>
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
  const { user }  = useUser();
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
    <aside
      className="hidden lg:flex"
      style={{
        flexDirection: "column",
        width: collapsed ? "64px" : "240px",
        background: t.bg,
        borderRight: `1px solid ${t.borderLight}`,
        transition: "width 0.2s ease",
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
  );
}