// app/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, CalendarDays, Star, DollarSign } from "lucide-react";
import { t, StatCard, SectionTitle, StatusBadge, OrganizerLoading } from "@/components/dashboard/OrganizerUI";

interface Stats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  pendingAttendees: number;
  checkedInCount: number;
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
  totalFeedbacks: number;
}

interface EventPerf {
  id: string;
  title: string;
  status: string;
  capacity: number;
  seatsRemaining: number;
  startDate: string;
  eventType: string;
  price?: number | null;
  _count: { registrations: number };
}

export default function OrganizerAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          fetch("/api/organizer/stats"),
          fetch("/api/organizer/events?pageSize=50"),
        ]);
        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data.counts); }
        if (eventsRes.ok) { const d = await eventsRes.json(); setEvents(d.data || []); }
      } catch { /* */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <OrganizerLoading />;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Derived metrics
  const avgFillRate = events.length > 0
    ? Math.round(events.reduce((s, e) => s + ((e.capacity - e.seatsRemaining) / e.capacity) * 100, 0) / events.length)
    : 0;
  const topEvent = events.length > 0
    ? events.reduce((best, e) => (e._count.registrations > best._count.registrations ? e : best), events[0])
    : null;

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Performance overview across your events.</p>
      </div>

      {/* Key metrics */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          <StatCard label="Total Events" value={stats.totalEvents} sub={`${stats.publishedEvents} published`} />
          <StatCard label="Attendees" value={stats.totalAttendees} sub={`${stats.checkedInCount} checked in`} />
          <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub={`${stats.totalOrders} orders`} />
          <StatCard label="Avg Rating" value={stats.averageRating ? `${stats.averageRating}/5` : "—"} sub={`${stats.totalFeedbacks} reviews`} />
          <StatCard label="Fill Rate" value={`${avgFillRate}%`} sub="avg capacity used" />
          <StatCard label="Upcoming" value={stats.upcomingEvents} />
        </div>
      )}

      {/* Top performer */}
      {topEvent && (
        <div style={{ marginBottom: "32px" }}>
          <SectionTitle title="Top Performing Event" />
          <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: "0 0 4px", fontFamily: t.serif }}>{topEvent.title}</p>
              <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>
                {fmtDate(topEvent.startDate)} · {topEvent._count.registrations} registrations · {topEvent.eventType === "FREE" ? "Free" : `$${topEvent.price}`}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <StatusBadge status={topEvent.status} />
              <span style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.accent }}>
                {topEvent.capacity > 0 ? Math.round(((topEvent.capacity - topEvent.seatsRemaining) / topEvent.capacity) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Event performance table */}
      <SectionTitle title="Event Performance" />
      {events.length === 0 ? (
        <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "40px 0" }}>No events yet.</p>
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", overflow: "hidden" }}>
          <div className="hidden md:grid" style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}>
            <span>Event</span><span>Date</span><span>Status</span><span>Registrations</span><span>Fill Rate</span>
          </div>
          {events.map((ev, i) => {
            const registered = ev.capacity - ev.seatsRemaining;
            const pct = ev.capacity > 0 ? Math.round((registered / ev.capacity) * 100) : 0;
            return (
              <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none" }} className="grid-cols-1 md:grid-cols-none">
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</p>
                  <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{ev.eventType === "FREE" ? "Free" : `$${ev.price}`}</p>
                </div>
                <span style={{ fontSize: "12px", color: t.textMuted }}>{fmtDate(ev.startDate)}</span>
                <StatusBadge status={ev.status} />
                <span style={{ fontSize: "13px", color: t.text, fontVariantNumeric: "tabular-nums" }}>{registered}/{ev.capacity}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ flex: 1, maxWidth: "60px", height: "4px", background: t.borderLight, borderRadius: "2px" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? t.green : t.accent, borderRadius: "2px" }} />
                  </div>
                  <span style={{ fontSize: "12px", color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}