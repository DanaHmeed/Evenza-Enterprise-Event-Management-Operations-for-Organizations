// app/(root)/orders/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Calendar,
  MapPin,
  Globe,
  Loader2,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Design tokens — identical to profile & tickets
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
  dark: "#1a1a2e",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    banner: string | null;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    city: string | null;
    venueName: string | null;
  };
}

/* ═══════════════════════════════════════════
   Status config — module-level, never re-created
   ═══════════════════════════════════════════ */
const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; dot: string; label: string; Icon: React.ElementType }
> = {
  PAID:     { color: t.green,      bg: t.greenSoft,            dot: t.green,      label: "Paid",     Icon: CheckCircle2 },
  PENDING:  { color: "#b45309",    bg: "rgba(180,83,9,0.07)",  dot: "#b45309",    label: "Pending",  Icon: Clock        },
  FAILED:   { color: t.accent,     bg: t.accentSoft,           dot: t.accent,     label: "Failed",   Icon: XCircle      },
  REFUNDED: { color: t.textMuted,  bg: t.borderLight,          dot: t.textFaint,  label: "Refunded", Icon: RefreshCw    },
};
const STATUS_FALLBACK = STATUS_CONFIG.PENDING;

const FILTERS = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"] as const;
type Filter = typeof FILTERS[number];

/* ═══════════════════════════════════════════
   Pure helpers — module-level
   ═══════════════════════════════════════════ */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtMonthDay = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const toNum = (v: unknown) => (typeof v === "object" ? Number(v) : (v as number));

/* ═══════════════════════════════════════════
   SectionHeader — same pattern as profile
   ═══════════════════════════════════════════ */
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
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
        {title}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   StatusBadge — memoised, shared atom
   ═══════════════════════════════════════════ */
const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const ss = STATUS_CONFIG[status] || STATUS_FALLBACK;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "3px",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: ss.color,
        background: ss.bg,
        flexShrink: 0,
      }}
    >
      <span
        style={{ width: "5px", height: "5px", borderRadius: "50%", background: ss.dot }}
      />
      {ss.label}
    </span>
  );
});

/* ═══════════════════════════════════════════
   Filter tab bar — memoised
   ═══════════════════════════════════════════ */
const FilterBar = memo(function FilterBar({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        paddingBottom: "2px",
        scrollbarWidth: "none",
      }}
    >
      {FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: "7px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: t.sans,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: `1px solid ${isActive ? t.text : t.borderLight}`,
              background: isActive ? t.text : t.surface,
              color: isActive ? "#fff" : t.textMuted,
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = t.border;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.borderColor = t.borderLight;
            }}
          >
            {f === "ALL" ? "All Orders" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        );
      })}
    </div>
  );
});

/* ═══════════════════════════════════════════
   Order row card — memoised
   ═══════════════════════════════════════════ */
const OrderCard = memo(function OrderCard({ order }: { order: Order }) {
  const amount = toNum(order.amount);

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = t.border;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = t.borderLight;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex" }}>
        {/* Banner */}
        <div
          style={{
            width: "112px",
            minHeight: "112px",
            flexShrink: 0,
            position: "relative",
            background: t.dark,
            overflow: "hidden",
          }}
        >
          {order.event.banner ? (
            <Image
              src={order.event.banner}
              alt=""
              fill
              sizes="112px"
              style={{ objectFit: "cover", opacity: 0.85 }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "112px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays
                style={{ width: "20px", height: "20px", color: "rgba(255,255,255,0.12)" }}
              />
            </div>
          )}
          {/* Date chip */}
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              borderRadius: "3px",
              padding: "3px 7px",
            }}
          >
            <span
              style={{
                fontFamily: t.sans,
                fontSize: "10px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                whiteSpace: "nowrap",
              }}
            >
              {fmtMonthDay(order.event.startDate)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, padding: "18px 20px" }}>
          {/* Top row: title + status */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
                href={`/events/${order.event.id}`}
                style={{
                  fontFamily: t.serif,
                  fontSize: "15px",
                  fontWeight: 600,
                  color: t.text,
                  textDecoration: "none",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                }}
              >
                {order.event.title}
              </Link>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "10px",
                  color: t.textFaint,
                  letterSpacing: "0.06em",
                  display: "block",
                  marginTop: "3px",
                }}
              >
                {order.orderNumber}
              </span>
            </div>
            <StatusBadge status={order.paymentStatus} />
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: t.textMuted,
              }}
            >
              <Calendar style={{ width: "12px", height: "12px", flexShrink: 0 }} />
              {fmtDate(order.event.startDate)}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: t.textMuted,
              }}
            >
              {order.event.isOnline ? (
                <Globe style={{ width: "12px", height: "12px", flexShrink: 0 }} />
              ) : (
                <MapPin style={{ width: "12px", height: "12px", flexShrink: 0 }} />
              )}
              {order.event.isOnline
                ? "Online"
                : order.event.city || order.event.venueName || "TBA"}
            </span>
          </div>

          {/* Bottom row: amount + link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${t.borderLight}`,
              paddingTop: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span
                style={{
                  fontFamily: t.serif,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: t.text,
                  letterSpacing: "-0.02em",
                }}
              >
                ${amount.toFixed(2)}
              </span>
              <span style={{ fontSize: "10px", color: t.textFaint, fontWeight: 600 }}>
                {order.currency}
              </span>
              {order.paidAt && (
                <>
                  <span style={{ color: t.borderLight, fontSize: "12px" }}>·</span>
                  <span style={{ fontSize: "11px", color: t.textFaint }}>
                    Paid {fmtDate(order.paidAt)}
                  </span>
                </>
              )}
            </div>

            <Link
              href={`/events/${order.event.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: t.accent,
                textDecoration: "none",
                fontFamily: t.sans,
              }}
            >
              View Event
              <ArrowUpRight style={{ width: "12px", height: "12px" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   Empty state
   ═══════════════════════════════════════════ */
function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "6px",
          background: t.borderLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <CreditCard style={{ width: "22px", height: "22px", color: t.textFaint }} />
      </div>
      <h3
        style={{
          fontFamily: t.serif,
          fontSize: "20px",
          fontWeight: 600,
          color: t.text,
          margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}
      >
        No orders yet
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: t.textMuted,
          margin: "0 0 24px",
          lineHeight: 1.6,
        }}
      >
        When you purchase event tickets, they&apos;ll appear here.
      </p>
      <Link
        href="/events"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "10px 20px",
          background: t.text,
          color: "#fff",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: t.sans,
        }}
      >
        Browse Events
        <ArrowUpRight style={{ width: "14px", height: "14px" }} />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */
export default function OrdersPage() {
  const { user, isSignedIn } = useUser();
  const [allOrders, setAllOrders]   = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>("ALL");

  // Single fetch on mount — filter client-side, zero extra requests
  useEffect(() => {
    if (!isSignedIn || !user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setAllOrders(data.data || []);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isSignedIn, user]);

  // Client-side filter — no re-fetch, instant response
  const filtered = useMemo(
    () => (filter === "ALL" ? allOrders : allOrders.filter((o) => o.paymentStatus === filter)),
    [allOrders, filter]
  );

  // Stats computed once from allOrders
  const { totalOrders, totalSpent, completed } = useMemo(() => ({
    totalOrders: allOrders.length,
    totalSpent:  allOrders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((s, o) => s + toNum(o.amount), 0),
    completed: allOrders.filter((o) => o.paymentStatus === "PAID").length,
  }), [allOrders]);

  const handleFilter = useCallback((f: Filter) => setFilter(f), []);

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {/* ── Dark header band ── */}
      <div
        style={{
          background: t.dark,
          height: "180px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "20%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 80px" }}>

        {/* ── Header card ── */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "6px",
            marginTop: "-80px",
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {/* Top section: icon + title + stats */}
          <div
            style={{
              padding: "28px 32px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: t.borderLight,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Receipt style={{ width: "18px", height: "18px", color: t.textMuted }} />
              </div>
              <div>
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
                  My Orders
                </h1>
                <p style={{ fontSize: "13px", color: t.textMuted, margin: "3px 0 0" }}>
                  Purchase history and payment details
                </p>
              </div>
            </div>

            {/* Stat chips */}
            {!loading && allOrders.length > 0 && (
              <div
                style={{
                  display: "flex",
                  overflow: "hidden",
                  borderRadius: "4px",
                  border: `1px solid ${t.borderLight}`,
                }}
              >
                {[
                  { label: "Orders",    value: totalOrders,            serif: true  },
                  { label: "Completed", value: completed,              serif: true  },
                  { label: "Spent",     value: `$${totalSpent.toFixed(2)}`, serif: false },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      background: t.bg,
                      padding: "10px 20px",
                      textAlign: "center",
                      borderLeft: i > 0 ? `1px solid ${t.borderLight}` : "none",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: s.serif ? t.serif : t.sans,
                        fontSize: s.serif ? "18px" : "16px",
                        fontWeight: 600,
                        color: s.label === "Spent" ? t.green : t.text,
                        margin: "0 0 1px",
                        letterSpacing: s.serif ? "-0.01em" : "0",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: t.textFaint,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        margin: 0,
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter bar inside card, bordered top */}
          {!loading && allOrders.length > 0 && (
            <div
              style={{
                borderTop: `1px solid ${t.borderLight}`,
                padding: "16px 32px",
              }}
            >
              <FilterBar active={filter} onChange={handleFilter} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ marginTop: "32px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 0",
                gap: "10px",
              }}
            >
              <Loader2
                className="animate-spin"
                style={{ width: "20px", height: "20px", color: t.accent }}
              />
              <span style={{ fontSize: "13px", color: t.textMuted }}>
                Loading orders…
              </span>
            </div>
          ) : allOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SectionHeader
                title={
                  filter === "ALL"
                    ? `All Orders`
                    : `${filter.charAt(0) + filter.slice(1).toLowerCase()} Orders`
                }
              />

              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: t.surface,
                    border: `1px solid ${t.borderLight}`,
                    borderRadius: "6px",
                  }}
                >
                  <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>
                    No {filter.toLowerCase()} orders found.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filtered.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}