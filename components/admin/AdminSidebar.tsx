// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard, Users, CalendarDays, MessageSquare,
  ChevronLeft, X, DollarSign, Tag, Mail,
} from "lucide-react";
import { t } from "@/components/admin/AdminUI";

interface NavItem  { label: string; href: string; icon: React.ReactNode; count?: number }
interface NavGroup { title: string; items: NavItem[] }

const SZ = { width: "16px", height: "16px" };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard",   href: "/admin",            icon: <LayoutDashboard style={SZ} /> },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users",       href: "/admin/users",      icon: <Users       style={SZ} /> },
      { label: "Events",      href: "/admin/events",     icon: <CalendarDays style={SZ} /> },
      { label: "Orders",      href: "/admin/orders",     icon: <DollarSign  style={SZ} /> },
      { label: "Feedback",    href: "/admin/feedback",   icon: <MessageSquare style={SZ} /> },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Categories",  href: "/admin/categories", icon: <Tag         style={SZ} /> },
      { label: "Messages",    href: "/admin/messages",   icon: <Mail        style={SZ} /> },
    ],
  },
];

interface NavContentProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isActive: (href: string) => boolean;
  user: ReturnType<typeof useUser>["user"];
  onNavigate?: () => void;
}

/* ─── Shared nav content ─── */
function NavContent({ collapsed, setCollapsed, isActive, user, onNavigate }: NavContentProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", //fontFamily: t.sans 
      }}>

      {/* Logo row */}
      <div style={{
        height: "60px", padding: collapsed ? "0 14px" : "0 18px",
        borderBottom: `1px solid ${t.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        {collapsed ? (
          <div onClick={() => setCollapsed(false)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <img src="/icons/Logomark.png" alt="Evenza"
              style={{ height: "18px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </div>
        ) : (
          <>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: "8px",
              textDecoration: "none", fontSize: "15px", fontWeight: 600,
              letterSpacing: "-0.02em", color: t.text, flexShrink: 0,
            }}>
              <img src="/icons/Logomark.png" alt=""
                style={{ height: "18px", width: "auto", filter: "brightness(0) invert(1)" }} />
              <span>Evenza</span>
              <span style={{
                fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: t.accent,
                background: t.accentSoft, padding: "2px 5px", borderRadius: "3px",
              }}>
                Admin
              </span>
            </Link>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setCollapsed(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "26px", height: "26px", borderRadius: "5px",
                border: "none", background: "transparent", color: t.textMuted,
                cursor: "pointer", transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.surfaceActive;
                e.currentTarget.style.color = t.textSecondary;
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

      {/* Nav groups */}
      <nav style={{
        flex: 1, overflowY: "auto", scrollbarWidth: "none",
        padding: collapsed ? "16px 8px" : "16px 10px",
      }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: "26px" }}>
            {!collapsed && (
              <p style={{
                fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.18em", color: t.textFaint,
                padding: "0 10px", margin: "0 0 6px 0", 
              }}>
                {group.title}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div style={{ height: "1px", background: t.borderLight, margin: "0 4px 14px" }} />
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
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: "10px",
                      padding: collapsed ? "9px" : "8px 12px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: active ? 600 : 400,
                      //fontFamily: t.sans,
                      color: active ? t.text : t.textSecondary,
                      background: active ? t.accentSoft : "transparent",
                      transition: "background 0.12s, color 0.12s",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = t.surface;
                        (e.currentTarget as HTMLAnchorElement).style.color = t.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = t.textSecondary;
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {active && !collapsed && (
                      <div style={{
                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                        width: "2px", borderRadius: "0 2px 2px 0", background: t.accent,
                      }} />
                    )}
                    <span style={{ display: "flex", flexShrink: 0, color: active ? t.accent : t.textMuted, transition: "color 0.12s" }}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span style={{
                            fontSize: "10px", fontWeight: 700, color: t.accent,
                            background: t.accentSoft, padding: "1px 6px",
                            borderRadius: "20px", fontVariantNumeric: "tabular-nums",
                          }}>
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

      {/* User footer */}
      <div style={{
        borderTop: `1px solid ${t.borderLight}`,
        padding: collapsed ? "14px 8px" : "14px",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" style={{
              width: "30px", height: "30px", borderRadius: "50%",
              objectFit: "cover", flexShrink: 0,
              border: `1px solid ${t.borderLight}`,
            }} />
          ) : (
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: t.accentSoft, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: t.accent }}>
                {user?.firstName?.[0] || "A"}
              </span>
            </div>
          )}
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: "12px", fontWeight: 600, color: t.text,
                margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user?.fullName || "Admin"}
              </p>
              <p style={{ fontSize: "10px", color: t.accent, margin: "1px 0 0", fontWeight: 600, letterSpacing: "0.05em" }}>
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname    = usePathname();
  const { user }    = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 40 }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className="lg:hidden"
        style={{
          position: "fixed", top: 0, left: 0, height: "100%", width: "250px",
          background: "#0e0e12", zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          borderRight: `1px solid ${t.borderLight}`,
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: "absolute", top: "16px", right: "16px",
            width: "28px", height: "28px", borderRadius: "4px",
            border: "none", background: "transparent", color: t.textMuted,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X style={{ width: "16px", height: "16px" }} />
        </button>
        <NavContent
          collapsed={false}
          setCollapsed={setCollapsed}
          isActive={isActive}
          user={user}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          flexDirection: "column",
          width: collapsed ? "60px" : "230px",
          background: "#0e0e12",
          borderRight: `1px solid ${t.borderLight}`,
          transition: "width 0.22s ease",
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