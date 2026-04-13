// app/dashboard/analytics/page.tsx
"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import {
  t,
  StatusBadge,
  OrganizerLoading,
} from "@/components/dashboard/OrganizerUI";
import { useDashboardStats, useOrganizerEvents } from "@/hooks/use-dashboard";

/* ─── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({
  label,
  value,
  sub,
  color = t.text,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div style={{
      background: "#fff",
      borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
      borderRadius: 6, padding: "16px 20px",
      flex: "1 1 0", minWidth: 0,
    }}>
      <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0, fontFamily: "Rubik, sans-serif" }}>
        {value}
      </p>
      <p style={{
        fontSize: 10, fontWeight: 700, color: t.textFaint, margin: "3px 0 0",
        textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Rubik, sans-serif",
      }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: t.textFaint, margin: "4px 0 0", fontFamily: "Rubik, sans-serif" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: t.textFaint,
      margin: "0 0 14px", fontFamily: "Rubik, sans-serif",
    }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function OrganizerAnalyticsPage() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { events, isLoading: eventsLoading } = useOrganizerEvents({
    page: 1,
    pageSize: 50,
  });

  const loading = statsLoading || eventsLoading;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const avgFillRate =
    events.length > 0
      ? Math.round(
          events.reduce(
            (s: number, e: { capacity: number; seatsRemaining: number }) =>
              s + ((e.capacity - e.seatsRemaining) / e.capacity) * 100,
            0
          ) / events.length
        )
      : 0;

  const topEvent =
    events.length > 0
      ? events.reduce(
          (
            best: { _count: { registrations: number } },
            e: { _count: { registrations: number } }
          ) => (e._count.registrations > best._count.registrations ? e : best),
          events[0]
        )
      : null;

  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
    borderRadius: 6, overflow: "hidden",
  };

  return (
    <div style={{ fontFamily: "Rubik, sans-serif", minHeight: "100vh", background: "#f7f7f4" }}>

      {/* ── Sticky top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff", borderBottom: `1px solid ${t.borderLight}`,
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
          <Link href="/dashboard" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500 }}>
            Dashboard
          </Link>
          <ChevronRight style={{ width: 13, height: 13, opacity: 0.4 }} />
          <span style={{ color: t.text, fontWeight: 600 }}>Analytics</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Rubik, sans-serif", fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
            Analytics
          </h1>
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
            Performance overview across your events.
          </p>
        </div>

        {loading ? (
          <OrganizerLoading />
        ) : (
          <>
            {/* ── Stat tiles ── */}
            {stats && (
              <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                <StatTile
                  label="Total Events"
                  value={stats.totalEvents}
                  sub={`${stats.publishedEvents} published`}
                />
                <StatTile
                  label="Attendees"
                  value={stats.totalAttendees}
                  sub={`${stats.checkedInCount} checked in`}
                  color={t.accent}
                />
                <StatTile
                  label="Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  sub={`${stats.totalOrders} orders`}
                  color={t.green}
                />
                <StatTile
                  label="Avg Rating"
                  value={stats.averageRating ? `${stats.averageRating}/5` : "—"}
                  sub={`${stats.totalFeedbacks} reviews`}
                />
                <StatTile
                  label="Fill Rate"
                  value={`${avgFillRate}%`}
                  sub="avg capacity used"
                  color={avgFillRate > 75 ? t.green : t.text}
                />
                <StatTile label="Upcoming" value={stats.upcomingEvents} />
              </div>
            )}

            {/* ── Top performer ── */}
            {topEvent && (
              <div style={{ marginBottom: 24 }}>
                <SectionLabel>Top Performing Event</SectionLabel>
                <div style={{
                  ...card,
                  overflow: "visible",
                  padding: "20px 24px",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    {/* trophy accent */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 6,
                      background: t.accentSoft, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <TrendingUp style={{ width: 18, height: 18, color: t.accent }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: t.text, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {topEvent.title}
                      </p>
                      <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                        {fmtDate(topEvent.startDate)} · {topEvent._count.registrations} registrations ·{" "}
                        {topEvent.eventType === "FREE" ? "Free" : `$${topEvent.price}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusBadge status={topEvent.status} />
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 22, fontWeight: 600, color: t.accent, margin: 0, fontFamily: "Rubik, sans-serif" }}>
                        {topEvent.capacity > 0
                          ? Math.round(((topEvent.capacity - topEvent.seatsRemaining) / topEvent.capacity) * 100)
                          : 0}%
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: t.textFaint, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Fill rate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Event performance table ── */}
            <SectionLabel>Event Performance</SectionLabel>

            {events.length === 0 ? (
              <div style={{
                ...card,
                overflow: "visible",
                textAlign: "center",
                padding: "48px 24px",
              }}>
                <p style={{ fontSize: 13, color: t.textFaint, margin: 0 }}>No events yet.</p>
              </div>
            ) : (
              <div style={card}>
                {/* Header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1.2fr 1fr 1fr 1.4fr",
                  gap: 8, padding: "10px 20px",
                  background: t.borderLight,
                  fontSize: 10, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint,
                }}>
                  <span>Event</span>
                  <span>Date</span>
                  <span>Status</span>
                  <span>Registrations</span>
                  <span>Fill Rate</span>
                </div>

                {events.map((ev: {
                  id: string; title: string; status: string; capacity: number;
                  seatsRemaining: number; startDate: string;
                  eventType: string; price?: number | null;
                  _count: { registrations: number };
                }, i: number) => {
                  const registered = ev.capacity - ev.seatsRemaining;
                  const pct = ev.capacity > 0 ? Math.round((registered / ev.capacity) * 100) : 0;
                  const barColor = pct >= 90 ? t.red : pct >= 60 ? t.green : t.accent;

                  return (
                    <div
                      key={ev.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "3fr 1.2fr 1fr 1fr 1.4fr",
                        gap: 8, padding: "12px 20px", alignItems: "center",
                        borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Event title */}
                      <div style={{ minWidth: 0 }}>
                        <Link
                          href={`/dashboard/events/${ev.id}/edit`}
                          style={{ fontSize: 13, fontWeight: 600, color: t.text, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = t.accent)}
                          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = t.text)}
                        >
                          {ev.title}
                        </Link>
                        <p style={{ fontSize: 11, color: t.textFaint, margin: 0 }}>
                          {ev.eventType === "FREE" ? "Free" : `$${ev.price}`}
                        </p>
                      </div>

                      {/* Date */}
                      <span style={{ fontSize: 12, color: t.textMuted }}>
                        {fmtDate(ev.startDate)}
                      </span>

                      {/* Status */}
                      <StatusBadge status={ev.status} />

                      {/* Registrations */}
                      <span style={{ fontSize: 13, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                        {registered}
                        <span style={{ color: t.textFaint, fontWeight: 400 }}>/{ev.capacity}</span>
                      </span>

                      {/* Fill rate bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 80, height: 4, background: t.borderLight, borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 12, color: t.textMuted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}