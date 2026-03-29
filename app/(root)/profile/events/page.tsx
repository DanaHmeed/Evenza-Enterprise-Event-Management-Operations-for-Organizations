// app/(root)/profile/events/page.tsx
//
// 1. Paginated fetching (20 per page) instead of loading ALL registrations
// 2. "Load More" button with cursor-based pagination
// 3. next/image for event banners (auto WebP, lazy loading, sized to 100px)
// 4. Stats computed from loaded data + total from first page
// 5. Stable callbacks with useCallback

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Loader2,
  Calendar,
  MapPin,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";

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
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.06)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

interface Registration {
  id: string;
  status: string;
  checkedIn: boolean;
  createdAt: string;
  event: {
    id: string;
    title: string;
    summary?: string | null;
    banner?: string | null;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    venueName?: string | null;
    city?: string | null;
    eventType: "FREE" | "PAID";
    price?: number | null;
    category?: { name: string } | null;
  };
}

const PAGE_SIZE = 20;

export default function ProfileEventsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // ✅ Paginated fetch function
  const fetchRegistrations = useCallback(
    async (cursor?: string | null) => {
      if (!user?.id) return;

      const isInitial = !cursor;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
        });
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(`/api/users/${user.id}/registrations?${params}`);
        if (res.ok) {
          const data = await res.json();
          const newRegs = data.data || [];

          if (isInitial) {
            setRegistrations(newRegs);
          } else {
            setRegistrations((prev) => [...prev, ...newRegs]);
          }

          setNextCursor(data.pagination?.nextCursor || null);
          setHasMore(data.pagination?.hasMore || false);
        }
      } catch {
        console.error("Failed to fetch registrations");
      } finally {
        if (isInitial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/profile/events");
      return;
    }
    fetchRegistrations();
  }, [isLoaded, isSignedIn, user, router, fetchRegistrations]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor && !loadingMore) {
      fetchRegistrations(nextCursor);
    }
  }, [nextCursor, loadingMore, fetchRegistrations]);

  const now = useMemo(() => new Date(), []);

  // ✅ Group by month (memoized)
  const grouped = useMemo(() => {
    return registrations.reduce<Record<string, Registration[]>>((acc, reg) => {
      const d = new Date(reg.event.startDate);
      const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!acc[key]) acc[key] = [];
      acc[key].push(reg);
      return acc;
    }, {});
  }, [registrations]);

  const fmtDate = useCallback(
    (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const fmtTime = useCallback(
    (d: string) =>
      new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    []
  );

  const statusMap: Record<
    string,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    APPROVED: {
      color: t.green,
      bg: t.greenSoft,
      icon: <CheckCircle2 style={{ width: "12px", height: "12px" }} />,
      label: "Confirmed",
    },
    PENDING: {
      color: t.amber,
      bg: t.amberSoft,
      icon: <Clock style={{ width: "12px", height: "12px" }} />,
      label: "Pending",
    },
    REJECTED: {
      color: t.accent,
      bg: "rgba(230,57,70,0.06)",
      icon: <XCircle style={{ width: "12px", height: "12px" }} />,
      label: "Rejected",
    },
    CANCELLED: {
      color: t.textFaint,
      bg: t.borderLight,
      icon: <XCircle style={{ width: "12px", height: "12px" }} />,
      label: "Cancelled",
    },
  };

  // Stats from loaded data
  const upcomingCount = useMemo(
    () =>
      registrations.filter(
        (r) => new Date(r.event.startDate) > now && r.status !== "CANCELLED"
      ).length,
    [registrations, now]
  );
  const pastCount = useMemo(
    () => registrations.filter((r) => new Date(r.event.endDate) < now).length,
    [registrations, now]
  );
  const checkedInCount = useMemo(
    () => registrations.filter((r) => r.checkedIn).length,
    [registrations]
  );

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "96px 32px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <Link
            href="/profile"
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              border: `1px solid ${t.borderLight}`,
              color: t.textMuted,
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
          </Link>
          <h1
            style={{
              fontFamily: t.serif,
              fontSize: "24px",
              fontWeight: 600,
              color: t.text,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Event History
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: t.textMuted, margin: "0 0 32px 46px" }}>
          All events you&apos;ve registered for, organized by date.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: t.borderLight,
            borderRadius: "6px",
            overflow: "hidden",
            marginBottom: "40px",
          }}
        >
          {[
            { label: "Upcoming", value: upcomingCount, color: t.accent },
            { label: "Attended", value: pastCount, color: t.text },
            { label: "Checked In", value: checkedInCount, color: t.green },
          ].map((s, i) => (
            <div key={i} style={{ background: t.surface, padding: "20px 0", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: t.serif,
                  fontSize: "22px",
                  fontWeight: 600,
                  color: s.color,
                  margin: "0 0 2px",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2
              className="animate-spin"
              style={{ width: "24px", height: "24px", color: t.accent }}
            />
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <CalendarDays
              style={{ width: "40px", height: "40px", color: t.borderLight, margin: "0 auto 16px" }}
            />
            <h3
              style={{
                fontFamily: t.serif,
                fontSize: "18px",
                fontWeight: 600,
                color: t.text,
                margin: "0 0 8px",
              }}
            >
              No events yet
            </h3>
            <p style={{ fontSize: "14px", color: t.textMuted, margin: "0 0 24px" }}>
              Register for events and they&apos;ll appear here.
            </p>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                background: t.text,
                borderRadius: "4px",
                textDecoration: "none",
                fontFamily: t.sans,
              }}
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {Object.entries(grouped).map(([monthYear, regs]) => (
              <div key={monthYear}>
                {/* Month label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ width: "24px", height: "2px", background: t.accent }} />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: t.textMuted,
                    }}
                  >
                    {monthYear}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {regs.map((reg) => {
                    const sc = statusMap[reg.status] || statusMap.PENDING;
                    const isPast = new Date(reg.event.endDate) < now;

                    return (
                      <Link
                        key={reg.id}
                        href={`/events/${reg.event.id}`}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          background: t.surface,
                          border: `1px solid ${t.borderLight}`,
                          borderRadius: "6px",
                          overflow: "hidden",
                          textDecoration: "none",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          opacity: isPast ? 0.7 : 1,
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
                        {/* ✅ Thumbnail with next/image */}
                        <div
                          style={{ width: "100px", flexShrink: 0 }}
                          className="hidden sm:block"
                        >
                          {reg.event.banner ? (
                            <Image
                              src={reg.event.banner}
                              alt=""
                              width={100}
                              height={80}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                minHeight: "80px",
                                background: t.borderLight,
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

                        {/* Content */}
                        <div style={{ flex: 1, padding: "14px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: sc.color,
                                background: sc.bg,
                                padding: "2px 8px",
                                borderRadius: "3px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {sc.icon}
                              {sc.label}
                            </span>
                            {reg.checkedIn && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  color: t.green,
                                  background: t.greenSoft,
                                  padding: "2px 8px",
                                  borderRadius: "3px",
                                }}
                              >
                                Checked In
                              </span>
                            )}
                            {isPast && !reg.checkedIn && reg.status === "APPROVED" && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: t.textFaint,
                                  background: t.borderLight,
                                  padding: "2px 8px",
                                  borderRadius: "3px",
                                }}
                              >
                                Missed
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: t.text,
                              margin: "0 0 6px",
                            }}
                          >
                            {reg.event.title}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "12px",
                              fontSize: "12px",
                              color: t.textMuted,
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Calendar style={{ width: "12px", height: "12px" }} />
                              {fmtDate(reg.event.startDate)}, {fmtTime(reg.event.startDate)}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {reg.event.isOnline ? (
                                <Globe style={{ width: "12px", height: "12px" }} />
                              ) : (
                                <MapPin style={{ width: "12px", height: "12px" }} />
                              )}
                              {reg.event.isOnline ? "Online" : reg.event.city || "TBA"}
                            </span>
                            {reg.event.category && (
                              <span style={{ color: t.textFaint }}>
                                {reg.event.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ✅ Load More button */}
            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 32px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: t.textSecondary,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: "4px",
                    cursor: loadingMore ? "default" : "pointer",
                    fontFamily: t.sans,
                    opacity: loadingMore ? 0.6 : 1,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.borderColor = t.text;
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = t.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2
                        className="animate-spin"
                        style={{ width: "14px", height: "14px" }}
                      />
                      Loading...
                    </>
                  ) : (
                    "Load More Events"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}