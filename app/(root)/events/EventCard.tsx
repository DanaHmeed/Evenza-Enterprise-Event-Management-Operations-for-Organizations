// components/events/EventCard.tsx
"use client";

import Link from "next/link";
import { Calendar, MapPin, Globe, ArrowUpRight } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    slug?: string;
    title: string;
    summary?: string | null;
    banner?: string | null;
    startDate: string;
    endDate: string;
    eventType: "FREE" | "PAID";
    price?: number | null;
    currency?: string | null;
    isOnline: boolean;
    city?: string | null;
    venueName?: string | null;
    status: string;
    category?: {
      name: string;
      color?: string | null;
    } | null;
    _count?: {
      registrations: number;
    };
  };
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const day = d.getDate();
    return { month, day };
  };

  const formatFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const locationLabel = event.isOnline
    ? "Online"
    : event.city || event.venueName || "TBA";

  const isPast = new Date(event.endDate) < new Date();
  const isCancelled = event.status === "CANCELLED";
  const { month, day } = formatDate(event.startDate);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative flex flex-col"
      style={{ opacity: isPast || isCancelled ? 0.55 : 1 }}
    >
      {/* ── Image ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16 / 10", borderRadius: "6px" }}
      >
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          >
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: 300,
                color: "rgba(255,255,255,0.12)",
                fontFamily: "'Georgia', serif",
              }}
            >
              {event.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Status overlay */}
        {(isCancelled || isPast) && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(1px)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {isCancelled ? "Cancelled" : "Past Event"}
            </span>
          </div>
        )}

        {/* Date badge — top left */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            top: "8px",
            left: "8px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "4px",
            padding: "6px 10px",
            minWidth: "44px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "0.08em",
              color: "#e63946",
            }}
          >
            {month}
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#1a1a1a",
              fontFamily: "'Georgia', serif",
            }}
          >
            {day}
          </span>
        </div>

        {/* Arrow on hover */}
        <div
          className="absolute flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <ArrowUpRight style={{ width: "14px", height: "14px", color: "#1a1a1a" }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col" style={{ paddingTop: "16px" }}>
        {/* Category + Price */}
        <div className="flex items-center" style={{ gap: "8px", marginBottom: "8px" }}>
          {event.category && (
            <>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#e63946",
                }}
              >
                {event.category.name}
              </span>
              <span style={{ color: "#d4d4d4" }}>&middot;</span>
            </>
          )}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: event.eventType === "FREE" ? "#2d6a4f" : "#555",
            }}
          >
            {event.eventType === "FREE" ? "Free" : `$${event.price ?? 0}`}
          </span>
        </div>

        {/* Title */}
        <h3
          className="line-clamp-2 transition-opacity duration-200 group-hover:opacity-65"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#1a1a1a",
            fontFamily: "'Georgia', serif",
            margin: "0 0 10px 0",
          }}
        >
          {event.title}
        </h3>

        {/* Summary */}
        {event.summary && (
          <p
            className="line-clamp-2"
            style={{
              fontSize: "13px",
              lineHeight: 1.55,
              color: "#777",
              margin: "0 0 12px 0",
            }}
          >
            {event.summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-col" style={{ gap: "6px", marginTop: "auto" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <Calendar
              className="flex-shrink-0"
              style={{ width: "14px", height: "14px", color: "#aaa" }}
            />
            <span style={{ fontSize: "12px", color: "#666" }}>
              {formatFullDate(event.startDate)}, {formatTime(event.startDate)}
            </span>
          </div>
          <div className="flex items-center" style={{ gap: "8px" }}>
            {event.isOnline ? (
              <Globe
                className="flex-shrink-0"
                style={{ width: "14px", height: "14px", color: "#aaa" }}
              />
            ) : (
              <MapPin
                className="flex-shrink-0"
                style={{ width: "14px", height: "14px", color: "#aaa" }}
              />
            )}
            <span className="truncate" style={{ fontSize: "12px", color: "#666" }}>
              {locationLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}