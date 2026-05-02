// app/dashboard/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  CalendarPlus, CalendarDays, Users,
  ArrowRight, BarChart2, Loader2,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard";

// ── Color tokens ──────────────────────────────────────────────────────────────
const c = {
  a50:"#FAEEDA", a100:"#FAC775", a200:"#EF9F27", a600:"#854F0B", a800:"#633806",
  g50:"#EAF3DE", g200:"#97C459",  g600:"#3B6D11", g800:"#27500A",
  c50:"#FAECE7", c100:"#F5C4B3", c600:"#993C1D",
  p50:"#EEEDFE", p200:"#AFA9EC", p600:"#534AB7", p800:"#3C3489",
  b50:"#E6F1FB", b200:"#85B7EB", b600:"#185FA5", b800:"#0C447C",
  gr200:"#B4B2A9", gr400:"#888780",
} as const;

// ── Donut Chart ───────────────────────────────────────────────────────────────
// Segments must sum <= total. Uses SVG stroke-dasharray on stacked circles.
interface DonutSeg { value: number; color: string; label: string }

function DonutChart({
  segs, total, centerNum, centerLabel,
}: {
  segs: DonutSeg[]; total: number; centerNum: string; centerLabel: string;
}) {
  const R = 32, cx = 42, cy = 42;
  const C = 2 * Math.PI * R;
  let accum = 0;

  return (
    <svg viewBox="0 0 84 84" style={{ width: 72, height: 72, flexShrink: 0 }}>
      {/* background ring */}
      <circle cx={cx} cy={cy} r={R} fill="none"
        stroke="var(--color-border-tertiary,#e8e8e8)" strokeWidth="11" />
      {/* segments */}
      {segs.map((s, i) => {
        const frac = total > 0 ? s.value / total : 0;
        if (frac <= 0) return null;
        const dash = frac * C;
        const rot  = -90 + accum * 360;
        accum += frac;
        return (
          <circle key={i} cx={cx} cy={cy} r={R}
            fill="none" stroke={s.color} strokeWidth="11"
            strokeDasharray={`${dash} ${C - dash}`}
            transform={`rotate(${rot} ${cx} ${cy})`} />
        );
      })}
      {/* center text */}
      <text x={cx} y={cx - 3} textAnchor="middle" fontSize="13" fontWeight="500"
        fill="var(--color-text-primary,#111)">{centerNum}</text>
      <text x={cx} y={cx + 10} textAnchor="middle" fontSize="7.5"
        fill="var(--color-text-tertiary,#999)">{centerLabel}</text>
    </svg>
  );
}

// ── Semi-circle Gauge ─────────────────────────────────────────────────────────
function SemiGauge({
  pct, color, label,
}: {
  pct: number; color: string; label: string;
}) {
  const cx = 52, cy = 46, R = 34, sw = 10;
  const safe = Math.max(0, Math.min(100, Math.round(pct)));
  // upper semicircle: M left A R R 0 0 0 right  (sweep=0 → counter-clockwise → goes through top)
  const d = `M ${cx - R} ${cy} A ${R} ${R} 0 0 0 ${cx + R} ${cy}`;

  return (
    <svg viewBox="0 0 104 52" style={{ width: "100%", height: "auto" }}>
      {/* track */}
      <path d={d} fill="none"
        stroke="var(--color-border-tertiary,#e8e8e8)"
        strokeWidth={sw} strokeLinecap="round" pathLength="100" />
      {/* fill */}
      {safe > 0 && (
        <path d={d} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${safe} 100`}
          strokeDashoffset="0" />
      )}
      {/* labels */}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="13" fontWeight="500"
        fill="var(--color-text-primary,#111)">{safe}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7.5"
        fill="var(--color-text-tertiary,#999)">{label}</text>
    </svg>
  );
}

// ── Registration Fill Rate Chart ──────────────────────────────────────────────
function RegistrationChart({ events }: {
  events: { id: string; title: string; capacity: number; seatsRemaining: number; status: string }[]
}) {
  if (!events.length) return null;

  return (
    <div style={{
      border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
      borderRadius: 12, padding: 20,
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
          color: "var(--color-text-secondary,#666)",
        }}>Registration fill rate</span>
        <span style={{
          fontSize: 10, 
          color: "var(--color-text-tertiary,#999)",
        }}>registered / capacity</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {events.map(ev => {
          const registered = ev.capacity - ev.seatsRemaining;
          const pct = ev.capacity > 0 ? Math.round((registered / ev.capacity) * 100) : 0;
          const barColor   = pct >= 90 ? c.c600 : pct >= 60 ? c.g600 : c.b600;
          const trackColor = pct >= 90 ? c.c50  : pct >= 60 ? c.g50  : c.b50;

          return (
            <div key={ev.id}>
              {/* label row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 5,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: "var(--color-text-primary,#111)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: "70%",
                }}>{ev.title}</span>
                <span style={{
                  color: "var(--color-text-tertiary,#999)", flexShrink: 0,
                }}>{registered}/{ev.capacity}</span>
              </div>
              {/* track + fill */}
              <div style={{
                height: 6, borderRadius: 100,
                background: trackColor,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 100,
                  background: barColor,
                  minWidth: pct > 0 ? 4 : 0,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div style={{
        display: "flex", gap: 14, marginTop: 14,
        paddingTop: 12,
        borderTop: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
      }}>
        {[
          { color: c.b600, label: "< 60%"  },
          { color: c.g600, label: "60–90%" },
          { color: c.c600, label: "> 90%"  },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 20, height: 4, borderRadius: 100,
              background: item.color, display: "block", flexShrink: 0,
            }} />
            <span style={{
              fontSize: 10, 
              color: "var(--color-text-tertiary,#999)",
            }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { dot: string; bg: string; fg: string; label: string }> = {
  PUBLISHED: { dot: c.g600, bg: c.g50,  fg: c.g800,  label: "Published" },
  DRAFT:     { dot: c.a200, bg: c.a50,  fg: c.a800,  label: "Draft"     },
  CANCELLED: { dot: c.c600, bg: c.c50,  fg: c.c600,  label: "Cancelled" },
  UPCOMING:  { dot: c.p600, bg: c.p50,  fg: c.p800,  label: "Upcoming"  },
  ENDED:     { dot: c.gr400, bg: "var(--color-background-secondary,#f5f5f5)",
               fg: "var(--color-text-tertiary,#999)", label: "Ended" },
};
const getS = (k: string) => STATUS_CFG[k] ?? STATUS_CFG.UPCOMING;

// ── EventRow ──────────────────────────────────────────────────────────────────
function EventRow({ ev }: {
  ev: { id: string; title: string; startDate: string;
        status: string; capacity: number; seatsRemaining: number }
}) {
  const s   = getS(ev.status);
  const reg = ev.capacity - ev.seatsRemaining;
  const dt  = new Date(ev.startDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
  return (
    <Link href={`/dashboard/events/${ev.id}/edit`}
      style={{
        display: "grid", gridTemplateColumns: "9px 1fr auto",
        gap: "12px", alignItems: "center",
        padding: "9px 6px", borderRadius: "8px",
        borderBottom: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
        textDecoration: "none", transition: "background 0.12s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500,
          color: "var(--color-text-primary,#111)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{ev.title}</div>
        <div style={{
          color: "var(--color-text-tertiary,#999)", marginTop: 2, fontSize: 11,
        }}>{dt} · {reg}/{ev.capacity} registered</div>
      </div>
      <span style={{
        fontSize: 10, padding: "3px 9px", borderRadius: 100,
        whiteSpace: "nowrap",
        background: s.bg, color: s.fg,
      }}>{s.label}</span>
    </Link>
  );
}

// ── Quick actions ─────────────────────────────────────────────────────────────
const ACTIONS = [
  { label: "Create event",   href: "/dashboard/events/create", Icon: CalendarPlus },
  { label: "My events",      href: "/dashboard/events",        Icon: CalendarDays },
  { label: "Revenue report", href: "/dashboard/revenue",       Icon: BarChart2    },
  { label: "View feedback",  href: "/dashboard/feedback",      Icon: Users        },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }  = useUser();
  const { stats, recentEvents, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 className="animate-spin"
          style={{ width: 22, height: 22, color: c.a600 }} />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  // chart data derived from stats
  const other = stats
    ? Math.max(0, stats.totalEvents - stats.publishedEvents - stats.draftEvents - stats.upcomingEvents)
    : 0;

  const eventSegs = stats ? [
    { value: stats.publishedEvents, color: c.g200,  label: "Published" },
    { value: stats.draftEvents,     color: c.a100,  label: "Draft"     },
    { value: stats.upcomingEvents,  color: c.p200,  label: "Upcoming"  },
    { value: other,                 color: c.gr200, label: "Other"     },
  ] : [];

  const checkinPct = (stats && stats.totalAttendees > 0)
    ? Math.round((stats.checkedInCount / stats.totalAttendees) * 100)
    : 0;

  // ────────────────────────────────────────────────────────────────────────────
  return (
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        paddingBottom: 18,
        borderBottom: "1px solid var(--color-border-tertiary,#e8e8e8)",
        marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{
            fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
            color: "var(--color-text-primary,#111)",
          }}>Organizer Dashboard</div>
          <div style={{
            fontSize: 11, letterSpacing: "0.04em",
            color: "var(--color-text-tertiary,#999)", marginTop: 3,
          }}>
            Welcome back, {user?.firstName || "Organizer"} · {today}
          </div>
        </div>
        <Link href="/dashboard/events/create"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 8,
            background: "var(--color-text-primary,#111)",
            color: "var(--color-background-primary,#fff)",
            fontSize: 12, fontWeight: 500, textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <CalendarPlus style={{ width: 13, height: 13 }} />
          New event
        </Link>
      </div>

      {/* ── Compact stat strip ──────────────────────────────────────────────── */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6,1fr)",
          gap: "1px",
          background: "var(--color-border-tertiary,#e8e8e8)",
          border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
          borderRadius: 8, overflow: "hidden", marginBottom: 16,
        }}>
          {[
            { n: stats.totalEvents,          l: "events",     s: `${stats.publishedEvents} published`, hl: false },
            { n: stats.totalAttendees,        l: "attendees",  s: `${stats.pendingAttendees} pending`,  hl: false },
            { n: `$${stats.totalRevenue.toLocaleString()}`, l: "revenue", s: `${stats.totalOrders} orders`, hl: true },
            { n: stats.averageRating ? `${stats.averageRating}/5` : "—",
              l: "avg. rating", s: `${stats.totalFeedbacks} reviews`, hl: false },
            { n: stats.checkedInCount, l: "checked in",  s: "\u00a0", hl: false },
            { n: stats.upcomingEvents,  l: "upcoming",    s: "\u00a0", hl: false },
          ].map((item, i) => (
            <div key={i} style={{
              background: item.hl
                ? c.a50
                : "var(--color-background-primary,#fff)",
              padding: "12px 10px", textAlign: "center",
            }}>
              <div style={{
                fontSize: 20, fontWeight: 500, lineHeight: 1, marginBottom: 4,
                color: item.hl ? c.a600 : "var(--color-text-primary,#111)",
              }}>{String(item.n)}</div>
              <div style={{
                fontSize: 10,  letterSpacing: "0.04em",
                color: item.hl ? c.a600 : "var(--color-text-secondary,#666)",
              }}>{item.l}</div>
              <div style={{
                fontSize: 10, 
                color: item.hl ? c.a200 : "var(--color-text-tertiary,#999)",
                marginTop: 1,
              }}>{item.s}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alert pills ─────────────────────────────────────────────────────── */}
      {stats && (stats.pendingAttendees > 0 || stats.draftEvents > 0) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {stats.pendingAttendees > 0 && (
            <Link href="/dashboard/attendees"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 100,
                background: c.a50, border: `0.5px solid ${c.a100}`,
                fontSize: 11,  color: c.a800,
                textDecoration: "none",
              }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%",
                background: c.a600, display: "block", flexShrink: 0 }} />
              {stats.pendingAttendees} registration{stats.pendingAttendees !== 1 ? "s" : ""} awaiting approval
            </Link>
          )}
          {stats.draftEvents > 0 && (
            <Link href="/dashboard/events?status=DRAFT"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 100,
                background: "var(--color-background-secondary,#f5f5f5)",
                border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                fontSize: 11, 
                color: "var(--color-text-secondary,#666)", textDecoration: "none",
              }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%",
                background: c.gr400, display: "block", flexShrink: 0 }} />
              {stats.draftEvents} draft{stats.draftEvents !== 1 ? "s" : ""} ready to publish
            </Link>
          )}
        </div>
      )}

      {/* ── Two-column layout ────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)",
        gap: 16, alignItems: "start",
      }}>

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Recent events card */}
          <div style={{
            border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 14,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 500, 
                letterSpacing: "0.06em",
                color: "var(--color-text-secondary,#666)",
              }}>Recent events</span>
              <Link href="/dashboard/events"
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, 
                  color: "var(--color-text-tertiary,#999)", textDecoration: "none",
                }}>
                View all <ArrowRight style={{ width: 11, height: 11 }} />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CalendarDays style={{
                  width: 28, height: 28,
                  color: "var(--color-border-tertiary,#e8e8e8)",
                  margin: "0 auto 12px",
                }} />
                <p style={{ fontSize: 13, color: "var(--color-text-tertiary,#999)" }}>
                  No events yet.
                </p>
                <Link href="/dashboard/events/create"
                  style={{ fontSize: 13, fontWeight: 500, color: c.a600, textDecoration: "none" }}>
                  Create your first event →
                </Link>
              </div>
            ) : (
              <div>
                {recentEvents.map((ev: any) => <EventRow key={ev.id} ev={ev} />)}
              </div>
            )}
          </div>

          {/* ── Registration fill rate chart ─────────────────────────────── */}
          <RegistrationChart events={recentEvents} />

        </div>{/* end left column */}

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Charts card */}
          {stats && (
            <div style={{
              border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
              borderRadius: 12, padding: 20,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 500, 
                letterSpacing: "0.06em",
                color: "var(--color-text-secondary,#666)",
                marginBottom: 16,
              }}>Overview</div>

              {/* ── Two mini charts side by side ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Donut: events by status */}
                <div>
                  <div style={{
                    fontSize: 10, 
                    color: "var(--color-text-tertiary,#999)",
                    marginBottom: 10, letterSpacing: "0.04em",
                  }}>Events</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <DonutChart
                      segs={eventSegs}
                      total={stats.totalEvents}
                      centerNum={String(stats.totalEvents)}
                      centerLabel="total"
                    />
                    {/* legend */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                      {[
                        { color: c.g200,  label: "Published", val: stats.publishedEvents },
                        { color: c.a100,  label: "Draft",     val: stats.draftEvents     },
                        { color: c.p200,  label: "Upcoming",  val: stats.upcomingEvents  },
                        { color: c.gr200, label: "Other",     val: other                 },
                      ].filter(d => d.val > 0).map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: d.color, flexShrink: 0, display: "block",
                          }} />
                          <span style={{
                            fontSize: 10, 
                            color: "var(--color-text-secondary,#666)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{d.label}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 500,
                            color: "var(--color-text-primary,#111)", marginLeft: "auto",
                          }}>{d.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gauge: check-in rate */}
                <div>
                  <div style={{
                    fontSize: 10, 
                    color: "var(--color-text-tertiary,#999)",
                    marginBottom: 10, letterSpacing: "0.04em",
                  }}>Check-in rate</div>
                  <SemiGauge
                    pct={checkinPct}
                    color={c.b200}
                    label="checked in"
                  />
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 5, marginTop: 8,
                  }}>
                    {[
                      { label: "Checked in", val: stats.checkedInCount,    color: c.b200  },
                      { label: "Pending",    val: stats.pendingAttendees,   color: c.a100  },
                      { label: "Total",      val: stats.totalAttendees,     color: c.gr200 },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: row.color, flexShrink: 0, display: "block",
                        }} />
                        <span style={{
                          fontSize: 10, 
                          color: "var(--color-text-secondary,#666)",
                        }}>{row.label}</span>
                        <span style={{
                          fontSize: 10,  fontWeight: 500,
                          color: "var(--color-text-primary,#111)", marginLeft: "auto",
                        }}>{row.val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{
            border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
            borderRadius: 12, padding: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 500, 
              letterSpacing: "0.06em",
              color: "var(--color-text-secondary,#666)",
              marginBottom: 12,
            }}>Quick actions</div>
            {ACTIONS.map(({ label, href, Icon }) => (
              <Link key={href} href={href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 6px", borderRadius: 8,
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                  color: "var(--color-text-primary,#111)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: "var(--color-background-secondary,#f5f5f5)",
                  border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-secondary,#666)",
                }}>
                  <Icon style={{ width: 14, height: 14 }} />
                </div>
                {label}
              </Link>
            ))}
          </div>

          {/* Alerts */}
          {stats && (stats.pendingAttendees > 0 || stats.draftEvents > 0) && (
            <div style={{
              border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
              borderRadius: 12, padding: 20,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 500, 
                letterSpacing: "0.06em",
                color: "var(--color-text-secondary,#666)",
                marginBottom: 12,
              }}>Alerts</div>

              {stats.pendingAttendees > 0 && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 9,
                  padding: "9px 11px", marginBottom: 8, borderRadius: 8,
                  background: "var(--color-background-secondary,#f5f5f5)",
                  borderLeft: `2px solid ${c.a100}`,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: c.a600, marginTop: 5, flexShrink: 0, display: "block",
                  }} />
                  <div style={{
                    fontSize: 12, lineHeight: 1.55,
                    color: "var(--color-text-secondary,#666)",
                  }}>
                    <strong style={{ color: "var(--color-text-primary,#111)", fontWeight: 500 }}>
                      {stats.pendingAttendees} registrations
                    </strong>{" "}pending approval
                  </div>
                </div>
              )}

              {stats.draftEvents > 0 && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 9,
                  padding: "9px 11px", borderRadius: 8,
                  background: "var(--color-background-secondary,#f5f5f5)",
                  borderLeft: "2px solid var(--color-border-tertiary,#e8e8e8)",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: c.gr400, marginTop: 5, flexShrink: 0, display: "block",
                  }} />
                  <div style={{
                    fontSize: 12, lineHeight: 1.55,
                    color: "var(--color-text-secondary,#666)",
                  }}>
                    <strong style={{ color: "var(--color-text-primary,#111)", fontWeight: 500 }}>
                      {stats.draftEvents} draft{stats.draftEvents !== 1 ? "s" : ""}
                    </strong>{" "}ready to publish
                  </div>
                </div>
              )}
            </div>
          )}

        </div>{/* end right column */}
      </div>
    </div>
  );
}