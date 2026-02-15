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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const priceLabel =
    event.eventType === "FREE"
      ? "Free"
      : `$${event.price ?? 0}`;

  const locationLabel = event.isOnline
    ? "Via Zoom"
    : event.city || event.venueName || "TBA";

  const isPast = new Date(event.endDate) < new Date();

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-300 transition-all duration-300"
    >
      {/* Banner Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-orange-300" />
          </div>
        )}

        {/* Status badge for past/cancelled */}
        {isPast && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gray-900/70 text-white text-[11px] font-semibold backdrop-blur-sm">
            Ended
          </div>
        )}
        {event.status === "CANCELLED" && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[11px] font-semibold backdrop-blur-sm">
            Cancelled
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Price & Category row */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-bold ${
              event.eventType === "FREE" ? "text-green-600" : "text-orange-600"
            }`}
          >
            {priceLabel}
          </span>
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
        <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>
            {formatDate(event.startDate)}, {formatTime(event.startDate)}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {event.isOnline ? (
            <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <span className="truncate">{locationLabel}</span>
        </div>
      </div>
    </Link>
  );
}
