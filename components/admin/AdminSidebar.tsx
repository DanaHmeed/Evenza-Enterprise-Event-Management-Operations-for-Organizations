// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Tag,
  Mail,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Design tokens
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fff",
  bgHover: "#fafaf8",
  bgActive: "#f5f5f0",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#bbb",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.06)",
  sans: "'DM Sans', sans-serif",
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
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
      {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard style={iconSize} />,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: <Users style={iconSize} />,
      },
      {
        label: "Events",
        href: "/admin/events",
        icon: <CalendarDays style={iconSize} />,
      },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: <DollarSign style={iconSize} />,
      },
      {
        label: "Feedback",
        href: "/admin/feedback",
        icon: <MessageSquare style={iconSize} />,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Categories",
        href: "/admin/categories",
        icon: <Tag style={iconSize} />,
      },
      {
        label: "Messages",
        href: "/admin/messages",
        icon: <Mail style={iconSize} />,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: t.sans,
      }}
    >
      {/* ── Logo area ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "64px",
          padding: collapsed ? "0 12px" : "0 20px",
          borderBottom: `1px solid ${t.borderLight}`,
          flexShrink: 0,
        }}
       >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          <img
            src="/icons/black-logo.png"
            alt="Evenza"
            style={{
              height: collapsed ? "34px" : "34px",
              width: "auto",
              display: "block",
            }}
          />

          {!collapsed && (
            <img
              src="/icons/text.png"
              alt="Evenza"
              style={{
                height: "14px",
                width: "auto",
                display: "block",
                alignItems: "center",
              }}
            />
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
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
              transition: "color 0.15s, background 0.15s",
              marginLeft: "60px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.bgHover;
              e.currentTarget.style.color = t.textMuted;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = t.textFaint;
            }}
            className="hidden lg:flex"
          >
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
          </button>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              position: "absolute",
              right: "-12px",
              top: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: `1px solid ${t.border}`,
              background: t.bg,
              color: t.textMuted,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              zIndex: 10,
            }}
            className="hidden lg:flex"
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
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
            {/* Group title */}
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
                  fontFamily: t.sans,
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

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
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
                      color: active ? t.text : t.textSecondary,
                      background: active ? t.bgActive : "transparent",
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
                        color: active ? t.text : t.textMuted,
                      }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: t.textFaint,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {item.count}
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

      {/* ── User area ── */}
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
                background: t.bgActive,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: t.text }}
              >
                {user?.firstName?.[0] || "A"}
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
                {user?.fullName || "Admin"}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: t.textMuted,
                  margin: "1px 0 0",
                }}
              >
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle ── */}

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 40,
          }}
        />
      )}

      {/* ── Mobile sidebar ── */}
      <aside
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "260px",
          background: t.bg,
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          borderRight: `1px solid ${t.borderLight}`,
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "28px",
            height: "28px",
            borderRadius: "4px",
            border: "none",
            background: "transparent",
            color: t.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>

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
        <NavContent />
      </aside>
    </>
  );
}
