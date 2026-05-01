"use client";

import { useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Ticket,
  Calendar,
  MapPin,
  Globe,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  CalendarDays,
} from "lucide-react";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false, loading: () => <div style={{ width: 196, height: 196 }} /> }
);

const QRCodeSVGSmall = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false, loading: () => <div style={{ width: 44, height: 44 }} /> }
);

/* ── Design tokens ── */
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

export interface TicketData {
  id: string;
  ticketNumber: string;
  status: string;
  qrCode?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    banner?: string | null;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    venueName?: string | null;
    city?: string | null;
  };
  registration?: {
    status: string;
    checkedIn: boolean;
  } | null;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; dot: string; label: string }
> = {
  VALID:     { color: t.green,     bg: t.greenSoft,              dot: t.green,     label: "Valid"     },
  PAID:      { color: t.green,     bg: t.greenSoft,              dot: t.green,     label: "Paid"      },
  USED:      { color: "#1d4ed8",   bg: "rgba(29,78,216,0.07)",   dot: "#1d4ed8",   label: "Used"      },
  RESERVED:  { color: "#b45309",   bg: "rgba(180,83,9,0.07)",    dot: "#b45309",   label: "Reserved"  },
  CANCELLED: { color: t.textMuted, bg: t.borderLight,            dot: t.textFaint, label: "Cancelled" },
  REFUNDED:  { color: t.textMuted, bg: t.borderLight,            dot: t.textFaint, label: "Refunded"  },
};
const STATUS_FALLBACK = STATUS_CONFIG.RESERVED;

const fmtLong = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const fmtMonthDay = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const isPast = (d: string) => new Date(d) < new Date();
const isUpcoming = (tk: TicketData) =>
  !isPast(tk.event.endDate) && (tk.status === "VALID" || tk.status === "PAID");

function SectionHeader({ title, count }: { title: string; count?: number }) {
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
        {count !== undefined && (
          <span style={{ color: t.textFaint, marginLeft: "6px" }}>({count})</span>
        )}
      </span>
    </div>
  );
}

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
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ss.dot }} />
      {ss.label}
    </span>
  );
});

const QRModal = memo(function QRModal({
  ticket,
  onClose,
}: {
  ticket: TicketData;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: "6px",
          border: `1px solid ${t.border}`,
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: t.dark,
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 6px",
              }}
            >
              Your Ticket
            </p>
            <h3
              style={{
                fontFamily: t.serif,
                fontSize: "17px",
                fontWeight: 600,
                color: "#fff",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {ticket.event.title}
            </h3>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "6px 0 0" }}>
              {fmtLong(ticket.event.startDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              color: "rgba(255,255,255,0.5)",
              flexShrink: 0,
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        <div style={{ padding: "28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <div
              style={{
                padding: "16px",
                background: t.bg,
                border: `1px solid ${t.borderLight}`,
                borderRadius: "6px",
              }}
            >
              {ticket.qrCode ? (
                <QRCodeSVG value={ticket.qrCode} size={196} level="M" marginSize={0} />
              ) : (
                <div
                  style={{
                    width: "196px",
                    height: "196px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t.textFaint,
                    fontSize: "13px",
                    fontFamily: t.sans,
                  }}
                >
                  QR unavailable
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: `1px dashed ${t.border}`,
              paddingTop: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: t.textFaint,
                margin: "0 0 6px",
              }}
            >
              Ticket Number
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: t.text,
                margin: "0 0 14px",
              }}
            >
              {ticket.ticketNumber}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              <StatusBadge status={ticket.status} />
              {ticket.registration?.checkedIn && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 9px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#1d4ed8",
                    background: "rgba(29,78,216,0.07)",
                  }}
                >
                  <CheckCircle2 style={{ width: "11px", height: "11px" }} />
                  Checked In
                </span>
              )}
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: t.textFaint,
              margin: "16px 0 0",
              fontFamily: t.sans,
            }}
          >
            Present at event entrance for scanning
          </p>
        </div>
      </div>
    </div>
  );
});

const UpcomingCard = memo(function UpcomingCard({
  ticket,
  onShowQR,
}: {
  ticket: TicketData;
  onShowQR: (tk: TicketData) => void;
}) {
  const handleClick = useCallback(() => onShowQR(ticket), [ticket, onShowQR]);

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "2px", background: t.accent, opacity: 0.55 }} />

      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "128px",
            minHeight: "124px",
            flexShrink: 0,
            position: "relative",
            background: t.dark,
            overflow: "hidden",
          }}
        >
          {ticket.event.banner ? (
            <Image
              src={ticket.event.banner}
              alt=""
              fill
              sizes="128px"
              style={{ objectFit: "cover", opacity: 0.85 }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "124px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays
                style={{ width: "22px", height: "22px", color: "rgba(255,255,255,0.12)" }}
              />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              borderRadius: "3px",
              padding: "3px 8px",
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
              {fmtMonthDay(ticket.event.startDate)}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "20px 20px 20px 24px",
            display: "flex",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/events/${ticket.event.id}`}
              style={{
                fontFamily: t.serif,
                fontSize: "16px",
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
              {ticket.event.title}
            </Link>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
              {[
                { Icon: Calendar, label: fmtShort(ticket.event.startDate) },
                { Icon: Clock,    label: fmtTime(ticket.event.startDate) },
                {
                  Icon: ticket.event.isOnline ? Globe : MapPin,
                  label: ticket.event.isOnline
                    ? "Online"
                    : ticket.event.city || ticket.event.venueName || "TBA",
                },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    color: t.textMuted,
                  }}
                >
                  <Icon style={{ width: "12px", height: "12px", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color: t.textFaint,
                  background: t.borderLight,
                  padding: "3px 8px",
                  borderRadius: "3px",
                  letterSpacing: "0.05em",
                }}
              >
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <div
            style={{
              borderLeft: `1px dashed ${t.border}`,
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleClick}
              aria-label="Show QR code"
              title="Show QR code"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "6px",
                background: t.bg,
                border: `1px solid ${t.borderLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.background = t.accentSoft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.borderLight;
                e.currentTarget.style.background = t.bg;
              }}
            >
              {ticket.qrCode ? (
                <QRCodeSVGSmall value={ticket.qrCode} size={44} level="L" />
              ) : (
                <Ticket style={{ width: "20px", height: "20px", color: t.textFaint }} />
              )}
            </button>
            <button
              onClick={handleClick}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                fontWeight: 600,
                color: t.accent,
                fontFamily: t.sans,
                padding: 0,
              }}
            >
              View QR
              <ArrowUpRight style={{ width: "11px", height: "11px" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const PastRow = memo(function PastRow({ ticket }: { ticket: TicketData }) {
  return (
    <Link
      href={`/events/${ticket.event.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 20px",
        background: t.surface,
        border: `1px solid ${t.borderLight}`,
        borderRadius: "6px",
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
          width: "44px",
          height: "44px",
          borderRadius: "6px",
          overflow: "hidden",
          background: t.borderLight,
          flexShrink: 0,
          position: "relative",
        }}
      >
        {ticket.event.banner ? (
          <Image
            src={ticket.event.banner}
            alt=""
            width={44}
            height={44}
            style={{ objectFit: "cover" }}
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
            <CalendarDays style={{ width: "18px", height: "18px", color: t.textFaint }} />
          </div>
        )}
      </div>

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
          {ticket.event.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
          <span style={{ fontSize: "12px", color: t.textFaint }}>
            {fmtMonthDay(ticket.event.startDate)}
          </span>
          <span style={{ color: t.borderLight }}>·</span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: t.textFaint,
              letterSpacing: "0.04em",
            }}
          >
            {ticket.ticketNumber}
          </span>
        </div>
      </div>

      <StatusBadge status={ticket.status} />
    </Link>
  );
});

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
        <Ticket style={{ width: "22px", height: "22px", color: t.textFaint }} />
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
        No tickets yet
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: t.textMuted,
          margin: "0 0 24px",
          lineHeight: 1.6,
        }}
      >
        When you register or purchase tickets, they&apos;ll appear here.
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

export default function TicketsView({ tickets }: { tickets: TicketData[] }) {
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  const handleShowQR  = useCallback((tk: TicketData) => setSelectedTicket(tk), []);
  const handleCloseQR = useCallback(() => setSelectedTicket(null), []);

  const { upcoming, past } = useMemo(
    () => ({
      upcoming: tickets.filter(isUpcoming),
      past:     tickets.filter((tk) => !isUpcoming(tk)),
    }),
    [tickets]
  );

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {selectedTicket && (
        <QRModal ticket={selectedTicket} onClose={handleCloseQR} />
      )}

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
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "6px",
            marginTop: "-80px",
            position: "relative",
            zIndex: 1,
            padding: "28px 32px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
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
              <Ticket style={{ width: "18px", height: "18px", color: t.textMuted }} />
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
                My Tickets
              </h1>
              <p style={{ fontSize: "13px", color: t.textMuted, margin: "3px 0 0" }}>
                Your event passes and check-in details
              </p>
            </div>
          </div>

          {tickets.length > 0 && (
            <div
              style={{
                display: "flex",
                overflow: "hidden",
                borderRadius: "4px",
                border: `1px solid ${t.borderLight}`,
              }}
            >
              {[
                { label: "Total",    value: tickets.length },
                { label: "Upcoming", value: upcoming.length },
                { label: "Past",     value: past.length },
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
                      fontFamily: t.serif,
                      fontSize: "18px",
                      fontWeight: 600,
                      color: t.text,
                      margin: "0 0 1px",
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

        <div style={{ marginTop: "32px" }}>
          {tickets.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: "40px" }}>
                  <SectionHeader title="Upcoming" count={upcoming.length} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {upcoming.map((tk) => (
                      <UpcomingCard key={tk.id} ticket={tk} onShowQR={handleShowQR} />
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <SectionHeader title="Past & Other" count={past.length} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {past.map((tk) => (
                      <PastRow key={tk.id} ticket={tk} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
