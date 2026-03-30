// app/(root)/my-hub/page.tsx
//
// "My Hub" — Personal command center for attendees

"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Globe,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Timer,
  Flame,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Design tokens — matches profile page
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.08)",
  dark: "#1a1a2e",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface HubEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isOnline: boolean;
  city?: string | null;
  venueName?: string | null;
  banner?: string | null;
  category?: string | null;
}

interface HubRegistration {
  id: string;
  status: string;
  createdAt: string;
  event: HubEvent;
}

interface HubStats {
  totalRegistrations: number;
  eventsAttended: number;
  upcomingCount: number;
  reviewsGiven: number;
}

interface HubData {
  stats: HubStats;
  upcoming: HubRegistration[];
  past: HubRegistration[];
  recommended: HubEvent[];
  userName: string;
}

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const fullDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const timeOnly = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const daysUntil = (d: string): number => {
  const diff = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/* ═══════════════════════════════════════════
   Greeting based on time of day
   ═══════════════════════════════════════════ */
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export default function MyHubPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Single API call ──
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/my-hub");
      return;
    }

    const controller = new AbortController();

    const fetchHub = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/users/${user.id}/hub-summary`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          console.error("Failed to load hub data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
    return () => controller.abort();
  }, [isLoaded, isSignedIn, user, router]);

  // ── Memoized values ──
  const greeting = useMemo(() => getGreeting(), []);

  const nextEvent = useMemo(() => {
    if (!data?.upcoming.length) return null;
    return data.upcoming[0];
  }, [data?.upcoming]);

  const nextEventCountdown = useMemo(() => {
    if (!nextEvent) return null;
    const days = daysUntil(nextEvent.event.startDate);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  }, [nextEvent]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Upcoming",
        value: data.stats.upcomingCount,
        icon: <Timer style={{ width: 16, height: 16 }} />,
        color: t.accent,
        bg: t.accentSoft,
      },
      {
        label: "Attended",
        value: data.stats.eventsAttended,
        icon: <CheckCircle2 style={{ width: 16, height: 16 }} />,
        color: t.green,
        bg: t.greenSoft,
      },
      {
        label: "Registered",
        value: data.stats.totalRegistrations,
        icon: <CalendarDays style={{ width: 16, height: 16 }} />,
        color: t.amber,
        bg: t.amberSoft,
      },
      {
        label: "Reviews",
        value: data.stats.reviewsGiven,
        icon: <Star style={{ width: 16, height: 16 }} />,
        color: t.textSecondary,
        bg: t.borderLight,
      },
    ];
  }, [data]);

  // ── Loading ──
  if (!isLoaded || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          fontFamily: t.sans,
        }}
      >
        {/* Skeleton header */}
        <div style={{ background: t.dark, height: "140px" }} />
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              marginTop: "-40px",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                height: "20px",
                width: "260px",
                background: t.borderLight,
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                height: "14px",
                width: "180px",
                background: t.borderLight,
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Skeleton stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: "8px",
                  padding: "20px",
                  height: "80px",
                }}
              />
            ))}
          </div>

          {/* Skeleton cards */}
          <div style={{ marginTop: "32px" }}>
            <div
              style={{
                height: "14px",
                width: "120px",
                background: t.borderLight,
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            />
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: "8px",
                  height: "88px",
                  marginBottom: "8px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.userName?.split(" ")[0] || user?.firstName || "there";

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {/* ═══════════════════════════════════
          HEADER BAR
          ═══════════════════════════════════ */}
      <div
        style={{
          background: t.dark,
          height: "140px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle accent glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "15%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(230,57,70,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 32px 80px" }}>
        {/* ═══════════════════════════════════
            GREETING CARD
            ═══════════════════════════════════ */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "8px",
            marginTop: "-48px",
            position: "relative",
            zIndex: 1,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: t.serif,
                fontSize: "22px",
                fontWeight: 600,
                color: t.text,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {greeting}, {firstName}
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: t.textMuted,
                margin: "4px 0 0",
              }}
            >
              {nextEvent
                ? `Next event: ${nextEvent.event.title}`
                : "No upcoming events — discover something new"}
            </p>
          </div>

          {/* Countdown pill */}
          {nextEventCountdown && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: t.accentSoft,
                borderRadius: "100px",
                flexShrink: 0,
              }}
            >
              <Flame
                style={{ width: "14px", height: "14px", color: t.accent }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: t.accent,
                }}
              >
                {nextEventCountdown}
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════
            STATS ROW
            ═══════════════════════════════════ */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{
            display: "grid",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: t.surface,
                border: `1px solid ${t.borderLight}`,
                borderRadius: "8px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: s.bg,
                  color: s.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: t.serif,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: t.text,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: t.textMuted,
                    margin: "2px 0 0",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════
            UPCOMING EVENTS
            ═══════════════════════════════════ */}
        <div style={{ marginTop: "36px" }}>
          <SectionHeader
            title="Coming Up"
            action={
              data.upcoming.length > 3
                ? { label: "View all", href: "/profile/events" }
                : undefined
            }
          />

          {data.upcoming.length === 0 ? (
            <EmptyState
              message="No upcoming events"
              cta="Discover Events"
              href="/events"
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {data.upcoming.slice(0, 4).map((reg) => (
                <UpcomingEventCard key={reg.id} reg={reg} />
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════
            RECOMMENDED FOR YOU
            ═══════════════════════════════════ */}
        {data.recommended.length > 0 && (
          <div style={{ marginTop: "36px" }}>
            <SectionHeader
              title="Recommended for You"
              action={{ label: "Browse all", href: "/events" }}
            />
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {data.recommended.slice(0, 3).map((event) => (
                <RecommendedCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            PAST EVENTS
            ═══════════════════════════════════ */}
        {data.past.length > 0 && (
          <div style={{ marginTop: "36px" }}>
            <SectionHeader
              title="Event History"
              action={
                data.past.length > 4
                  ? { label: "View all", href: "/profile/events" }
                  : undefined
              }
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {data.past.slice(0, 5).map((reg) => (
                <PastEventRow key={reg.id} reg={reg} />
              ))}
            </div>
          </div>
        )}
     
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "20px", height: "2px", background: t.accent }} />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: t.textMuted,
          }}
        >
          {title}
        </span>
      </div>
      {action && (
        <Link
          href={action.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: t.accent,
            textDecoration: "none",
          }}
        >
          {action.label}
          <ArrowRight style={{ width: "12px", height: "12px" }} />
        </Link>
      )}
    </div>
  );
}

/* ── Upcoming event card (prominent) ── */
function UpcomingEventCard({ reg }: { reg: HubRegistration }) {
  const days = daysUntil(reg.event.startDate);
  const isToday = days === 0;
  const isTomorrow = days === 1;

  const urgencyLabel = isToday
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : `${days}d away`;

  return (
    <Link
      href={`/events/${reg.event.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 18px",
        background: t.surface,
        border: `1px solid ${isToday ? t.accent : t.borderLight}`,
        borderRadius: "8px",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isToday ? t.accent : t.borderLight;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "8px",
          overflow: "hidden",
          background: t.borderLight,
          flexShrink: 0,
          position: "relative",
        }}
      >
        {reg.event.banner ? (
          <Image
            src={reg.event.banner}
            alt=""
            width={52}
            height={52}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarDays
              style={{ width: "20px", height: "20px", color: t.textFaint }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {reg.event.title}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: t.textMuted,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock style={{ width: "11px", height: "11px" }} />
            {fullDate(reg.event.startDate)} · {timeOnly(reg.event.startDate)}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: t.textFaint,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {reg.event.isOnline ? (
              <Globe style={{ width: "11px", height: "11px" }} />
            ) : (
              <MapPin style={{ width: "11px", height: "11px" }} />
            )}
            {reg.event.isOnline
              ? "Online"
              : reg.event.city || reg.event.venueName || "TBA"}
          </span>
        </div>
      </div>

      {/* Countdown badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          padding: "6px 12px",
          borderRadius: "6px",
          background: isToday ? t.accentSoft : t.borderLight,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: isToday ? t.accent : t.textSecondary,
          }}
        >
          {urgencyLabel}
        </span>
      </div>
    </Link>
  );
}

/* ── Recommended event card (visual) ── */
function RecommendedCard({ event }: { event: HubEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.borderLight;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100%",
          height: "120px",
          background: t.borderLight,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {event.banner ? (
          <Image
            src={event.banner}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${t.borderLight} 0%, ${t.bg} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles
              style={{ width: "24px", height: "24px", color: t.textFaint }}
            />
          </div>
        )}
        {/* Category tag */}
        {event.category && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.92)",
              color: t.textSecondary,
              backdropFilter: "blur(4px)",
            }}
          >
            {event.category}
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: "14px 16px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.title}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "6px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: t.textMuted,
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Calendar style={{ width: "10px", height: "10px" }} />
            {shortDate(event.startDate)}
          </span>
          <span style={{ color: t.borderLight, fontSize: "10px" }}>·</span>
          <span
            style={{
              fontSize: "11px",
              color: t.textFaint,
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {event.isOnline ? (
              <Globe style={{ width: "10px", height: "10px" }} />
            ) : (
              <MapPin style={{ width: "10px", height: "10px" }} />
            )}
            {event.isOnline ? "Online" : event.city || "TBA"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Past event row (compact) ── */
function PastEventRow({ reg }: { reg: HubRegistration }) {
  const statusColors: Record<string, string> = {
    APPROVED: t.green,
    ATTENDED: t.green,
    PENDING: t.amber,
    REJECTED: t.accent,
    CANCELLED: t.textFaint,
  };

  return (
    <Link
      href={`/events/${reg.event.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 16px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.border)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.borderLight)}
    >
      {/* Date block */}
      <div
        style={{
          width: "40px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: t.textFaint,
            margin: 0,
          }}
        >
          {new Date(reg.event.startDate).toLocaleDateString("en-US", {
            month: "short",
          })}
        </p>
        <p
          style={{
            fontFamily: t.serif,
            fontSize: "18px",
            fontWeight: 600,
            color: t.text,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {new Date(reg.event.startDate).getDate()}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "28px",
          background: t.borderLight,
          flexShrink: 0,
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
          {reg.event.title}
        </p>
        <span
          style={{
            fontSize: "11px",
            color: t.textFaint,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "2px",
          }}
        >
          {reg.event.isOnline ? (
            <Globe style={{ width: "10px", height: "10px" }} />
          ) : (
            <MapPin style={{ width: "10px", height: "10px" }} />
          )}
          {reg.event.isOnline ? "Online" : reg.event.city || "TBA"}
        </span>
      </div>

      {/* Status dot */}
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: statusColors[reg.status] || t.textFaint,
          flexShrink: 0,
        }}
      />

      <ChevronRight
        style={{ width: "14px", height: "14px", color: t.borderLight, flexShrink: 0 }}
      />
    </Link>
  );
}

/* ── Quick action link ── */
function QuickAction({
  href,
  icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 18px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.borderLight;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          background: t.borderLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.textMuted,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: "11px", color: t.textMuted, margin: "2px 0 0" }}>
          {desc}
        </p>
      </div>
    </Link>
  );
}

/* ── Empty state ── */
function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "8px",
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <CalendarDays
        style={{
          width: "32px",
          height: "32px",
          color: t.borderLight,
          margin: "0 auto 12px",
        }}
      />
      <p style={{ fontSize: "14px", color: t.textMuted, margin: "0 0 12px" }}>
        {message}
      </p>
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: t.accent,
          textDecoration: "none",
        }}
      >
        {cta}
        <ArrowRight style={{ width: "13px", height: "13px" }} />
      </Link>
    </div>
  );
}