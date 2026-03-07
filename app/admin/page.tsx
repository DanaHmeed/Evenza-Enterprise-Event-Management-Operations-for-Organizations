// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CalendarDays,
  DollarSign,
  Ticket,
  ArrowRight,
  Loader2,
  MessageSquare,
  Star,
  Mail,
  Clock,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { t, StatusBadge, SectionTitle, StatCard } from "@/components/admin/AdminUI";

interface Stats {
  totalUsers: number;
  totalOrganizers: number;
  newUsersThisMonth: number;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  totalTickets: number;
  totalOrders: number;
  totalRevenue: number;
  pendingFeedbacks: number;
  totalFeedbacks: number;
  unreadMessages: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  createdAt: string;
}

interface RecentEvent {
  id: string;
  title: string;
  status: string;
  startDate: string;
  eventType: string;
  price?: number | null;
  organizer: { name: string };
  _count: { registrations: number };
}

interface RecentOrder {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  user: { name: string };
  event: { title: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const json = await res.json();
          const d = json.data;
          setStats(d.counts);
          setRecentUsers(d.recentUsers || []);
          setRecentEvents(d.recentEvents || []);
          setRecentOrders(d.recentOrders || []);
        }
      } catch {
        console.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: t.accent }} />
      </div>
    );
  }

  if (!stats) return null;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{ fontFamily: 'Quicksand' }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: 'Quicksand', fontSize: "24px", fontWeight: 600, color: t.text, margin: 4, letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px", margin:4}}>
          Platform overview · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Primary stats — 2x3 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="Total Users" value={stats.totalUsers} sub={`+${stats.newUsersThisMonth} this month`} onClick={() => router.push("/admin/users")} />
        <StatCard label="Organizers" value={stats.totalOrganizers} onClick={() => router.push("/admin/users?role=ORGANIZER")} />
        <StatCard label="Total Events" value={stats.totalEvents} sub={`${stats.publishedEvents} published`} onClick={() => router.push("/admin/events")} />
        <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub={`${stats.totalOrders} orders`} onClick={() => router.push("/admin/orders")} />
        <StatCard label="Registrations" value={stats.totalRegistrations} sub={`${stats.pendingRegistrations} pending`} />
        <StatCard label="Tickets Issued" value={stats.totalTickets} />
      </div>

      {/* Alert strip — pending items */}
      {(stats.pendingFeedbacks > 0 || stats.unreadMessages > 0 || stats.draftEvents > 0) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          {stats.pendingFeedbacks > 0 && (
            <Link
              href="/admin/feedback?status=PENDING"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: t.amberSoft,
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: t.amber,
                textDecoration: "none",
                fontFamily: t.sans,
              }}
            >
              <Star style={{ width: "14px", height: "14px" }} />
              {stats.pendingFeedbacks} feedback{stats.pendingFeedbacks > 1 ? "s" : ""} awaiting review
            </Link>
          )}
          {stats.unreadMessages > 0 && (
            <Link
              href="/admin/messages"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: t.blueSoft,
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: t.blue,
                textDecoration: "none",
                fontFamily: t.sans,
              }}
            >
              <Mail style={{ width: "14px", height: "14px" }} />
              {stats.unreadMessages} unread message{stats.unreadMessages > 1 ? "s" : ""}
            </Link>
          )}
          {stats.draftEvents > 0 && (
            <Link
              href="/admin/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: t.borderLight,
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: t.textMuted,
                textDecoration: "none",
                fontFamily: t.sans,
                marginInlineStart: "2px",
              }}
            >
              <Clock style={{ width: "14px", height: "14px",margin: "0 4px 0 0" }} />
              {stats.draftEvents} draft event{stats.draftEvents > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      {/* Three columns: Users, Events, Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Recent Users */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", padding: "24px" }}>
          <SectionTitle
            title="Recent Users"
            action={
              <Link href="/admin/users" style={{ fontSize: "12px", fontWeight: 600, color: t.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "12px", height: "12px" }} />
              </Link>
            }
          />
          {recentUsers.length === 0 ? (
            <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "24px 0" }}>No users yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {u.avatar ? (
                    <img src={u.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                      {u.name?.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{u.email}</p>
                  </div>
                  <StatusBadge status={u.role} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", padding: "24px" }}>
          <SectionTitle
            title="Recent Events"
            action={
              <Link href="/admin/events" style={{ fontSize: "12px", fontWeight: 600, color: t.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "12px", height: "12px" }} />
              </Link>
            }
          />
          {recentEvents.length === 0 ? (
            <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "24px 0" }}>No events yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: "2px 0 0" }}>
                      by {e.organizer.name} · {e._count.registrations} reg
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
                    <StatusBadge status={e.status} />
                    <span style={{ fontSize: "11px", color: t.textFaint }}>{fmtDate(e.startDate)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", padding: "24px" }}>
          <SectionTitle
            title="Recent Orders"
            action={
              <Link href="/admin/orders" style={{ fontSize: "12px", fontWeight: 600, color: t.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "12px", height: "12px" }} />
              </Link>
            }
          />
          {recentOrders.length === 0 ? (
            <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "24px 0" }}>No orders yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 8px",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.user.name}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.event.title}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                      ${o.amount}
                    </span>
                    <StatusBadge status={o.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", marginTop: "32px" }}>
        {[
          { label: "Users", href: "/admin/users", icon: <Users style={{ width: "16px", height: "16px" }} /> },
          { label: "Events", href: "/admin/events", icon: <CalendarDays style={{ width: "16px", height: "16px" }} /> },
          { label: "Orders", href: "/admin/orders", icon: <DollarSign style={{ width: "16px", height: "16px" }} /> },
          { label: "Feedback", href: "/admin/feedback", icon: <MessageSquare style={{ width: "16px", height: "16px" }} /> },
          { label: "Categories", href: "/admin/categories", icon: <ShieldCheck style={{ width: "16px", height: "16px" }} /> },
          { label: "Messages", href: "/admin/messages", icon: <Mail style={{ width: "16px", height: "16px" }} /> },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: t.surface,
              border: `1px solid ${t.borderLight}`,
              borderRadius: "4px",
              textDecoration: "none",
              color: t.textMuted,
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: t.sans,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.border)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.borderLight)}
          >
            {item.icon}
            <span style={{ color: t.text }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}