// components/events/EventCard.tsx
"use client";

import Link from "next/link";
import { Calendar, MapPin, Globe } from "lucide-react";

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
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const priceLabel = event.eventType === "FREE" ? "Free" : `$${event.price ?? 0}`;

  const locationLabel = event.isOnline
    ? "Via Zoom"
    : event.city || event.venueName || "TBA";

  const isPast = new Date(event.endDate) < new Date();

  const statusBadge =
    event.status === "CANCELLED"
      ? { label: "Cancelled", className: "bg-red-500/90" }
      : isPast
      ? { label: "Ended", className: "bg-gray-900/70" }
      : null;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block w-full max-w-sm overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50 "
    >
      {/* Banner */}
      <div className="relative aspect-[18/10] overflow-hidden bg-gray-100">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
            <Calendar className="h-10 w-10 text-orange-300" />
          </div>
        )}

        {statusBadge && (
          <div
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm ${statusBadge.className}`}
          >
            {statusBadge.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">{priceLabel}</span>

          {event.category && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-medium text-gray-500">
                {event.category.name}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-4 line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">
          {event.title}
        </h3>

        {/* Date */}
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>
            {formatDate(event.startDate)}, {formatTime(event.startDate)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {event.isOnline ? (
            <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          <span className="truncate">{locationLabel}</span>
        </div>
      </div>
    </Link>
  );
}