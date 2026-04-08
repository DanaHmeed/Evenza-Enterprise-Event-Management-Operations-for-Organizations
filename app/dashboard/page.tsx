// app/dashboard/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  CalendarDays,
  Users,
  ScanLine,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  t,
  StatusBadge,
  StatCard,
  SectionTitle,
} from "@/components/dashboard/OrganizerUI";
import { useDashboardStats } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const { stats, recentEvents, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: t.accent }} />
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div style={{ fontFamily: t.sans }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: t.serif, fontSize: "28px", fontWeight: 600, color: t.text, marginLeft: 2, marginTop: 6, letterSpacing: "-0.02em" }}>
            Welcome back, {user?.firstName || "Organizer"}
          </h1>
          <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px", marginLeft: 6, fontFamily: "Quicksand" }}>
            Here&apos;s your event overview.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", fontSize: "13px", fontWeight: 600,
            color: "#fff", background: t.text, borderRadius: "4px",
            textDecoration: "none", fontFamily: t.sans, margin: 6,
          }}
        >
          <CalendarPlus style={{ width: "14px", height: "14px" }} />
          Create Event
        </Link>
      </div>

      {/* Stats grid */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          <StatCard label="Total Events" value={stats.totalEvents} sub={`${stats.publishedEvents} published`} onClick={() => router.push("/dashboard/events")} />
          <StatCard label="Attendees" value={stats.totalAttendees} sub={`${stats.pendingAttendees} pending`} />
          <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub={`${stats.totalOrders} orders`} />
          <StatCard label="Rating" value={stats.averageRating ? `${stats.averageRating}/5` : "—"} sub={`${stats.totalFeedbacks} reviews`} />
          <StatCard label="Checked In" value={stats.checkedInCount} />
          <StatCard label="Upcoming" value={stats.upcomingEvents} />
        </div>
      )}

      {/* Alert strip */}
      {stats && (stats.pendingAttendees > 0 || stats.draftEvents > 0) && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          {stats.pendingAttendees > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: t.amberSoft, borderRadius: "4px", fontSize: "13px", fontWeight: 500, color: t.amber }}>
              <Users style={{ width: "14px", height: "14px" }} />
              {stats.pendingAttendees} registration{stats.pendingAttendees > 1 ? "s" : ""} awaiting approval
            </div>
          )}
          {stats.draftEvents > 0 && (
            <Link href="/dashboard/events?status=DRAFT" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: t.borderLight, borderRadius: "4px", fontSize: "13px", fontWeight: 500, color: t.textMuted, textDecoration: "none" }}>
              {stats.draftEvents} draft{stats.draftEvents > 1 ? "s" : ""} ready to publish
            </Link>
          )}
        </div>
      )}

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }} className="grid-cols-1 lg:grid-cols-none">
        {/* Recent Events */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", padding: "24px" }}>
          <SectionTitle
            title="Recent Events"
            action={
              <Link href="/dashboard/events" style={{ fontSize: "12px", fontWeight: 600, color: t.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <ArrowRight style={{ width: "12px", height: "12px" }} />
              </Link>
            }
          />
          {recentEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <CalendarDays style={{ width: "32px", height: "32px", color: t.borderLight, margin: "0 auto 12px" }} />
              <p style={{ fontSize: "13px", color: t.textFaint }}>No events yet.</p>
              <Link href="/dashboard/events/create" style={{ fontSize: "13px", fontWeight: 600, color: t.accent, textDecoration: "none" }}>
                Create your first event →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentEvents.map((e: { id: string; title: string; startDate: string; status: string; capacity: number; seatsRemaining: number }) => {
                const registered = e.capacity - e.seatsRemaining;
                return (
                  <Link
                    key={e.id}
                    href={`/dashboard/events/${e.id}/edit`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: "4px", textDecoration: "none", transition: "background 0.1s" }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = t.borderLight)}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</p>
                      <p style={{ fontSize: "11px", color: t.textFaint, margin: "2px 0 0" }}>
                        {fmtDate(e.startDate)} · {registered}/{e.capacity} registered
                      </p>
                    </div>
                    <StatusBadge status={e.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", padding: "24px" }}>
          <SectionTitle title="Quick Actions" />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { label: "Create Event", href: "/dashboard/events/create", icon: <CalendarPlus style={{ width: "16px", height: "16px" }} /> },
              { label: "My Events", href: "/dashboard/events", icon: <CalendarDays style={{ width: "16px", height: "16px" }} /> },
              { label: "QR Scanner", href: "/dashboard/scanner", icon: <ScanLine style={{ width: "16px", height: "16px" }} /> },
              { label: "My Profile", href: "/profile", icon: <Users style={{ width: "16px", height: "16px" }} /> },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 8px", borderRadius: "4px", textDecoration: "none", color: t.textMuted, fontSize: "13px", fontWeight: 500, transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted }}>
                  {a.icon}
                </div>
                <span style={{ color: t.text }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}