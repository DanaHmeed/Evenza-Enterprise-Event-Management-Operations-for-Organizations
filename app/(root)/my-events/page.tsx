// app/(root)/my-events/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Loader2,
  Calendar,
  MapPin,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Star,
} from "lucide-react";

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

export default function MyEventsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/my-events");
      return;
    }

    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}/registrations`);
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.data || []);
        }
      } catch {
        console.error("Failed to fetch registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [isLoaded, isSignedIn, user, router]);

  const now = new Date();

  const filtered = registrations.filter((r) => {
    const matchesSearch = r.event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isUpcoming = new Date(r.event.startDate) > now;
    const isPast = new Date(r.event.endDate) < now;

    switch (tab) {
      case "UPCOMING": return matchesSearch && isUpcoming;
      case "PAST": return matchesSearch && isPast;
      default: return matchesSearch;
    }
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
      PENDING: { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
      REJECTED: { bg: "bg-red-100", text: "text-red-600", icon: <XCircle className="w-3 h-3" /> },
      CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", icon: <XCircle className="w-3 h-3" /> },
      WAITLISTED: { bg: "bg-blue-100", text: "text-blue-600", icon: <Clock className="w-3 h-3" /> },
    };
    return map[status] || map.PENDING;
  };

  const handleCancel = async (registrationId: string, eventId: string) => {
    if (!confirm("Cancel this registration?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === registrationId ? { ...r, status: "CANCELLED" } : r
          )
        );
      }
    } catch {
      alert("Failed to cancel registration");
    }
  };

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Events you&apos;ve registered for.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(["ALL", "UPCOMING", "PAST"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No registrations found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {registrations.length === 0
                ? "You haven't registered for any events yet."
                : "Try a different filter or search."}
            </p>
            <Link href="/events" className="text-sm text-orange-600 font-semibold hover:underline">
              Browse Events →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((reg) => {
              const badge = getStatusBadge(reg.status);
              const isPast = new Date(reg.event.endDate) < now;
              const canCancel = !isPast && reg.status !== "CANCELLED" && reg.status !== "REJECTED";
              const canReview = isPast && reg.status === "APPROVED";

              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="sm:w-40 h-24 sm:h-auto bg-gray-100 flex-shrink-0">
                      {reg.event.banner ? (
                        <img src={reg.event.banner} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                          <CalendarDays className="w-6 h-6 text-orange-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                              {badge.icon}
                              {reg.status}
                            </span>
                            {reg.event.category && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {reg.event.category.name}
                              </span>
                            )}
                            {reg.checkedIn && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                ✓ CHECKED IN
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/events/${reg.event.id}`}
                            className="text-base font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1"
                          >
                            {reg.event.title}
                          </Link>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(reg.event.startDate)} at {formatTime(reg.event.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              {reg.event.isOnline ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {reg.event.isOnline ? "Online" : reg.event.city || reg.event.venueName || "TBA"}
                            </span>
                            <span className="text-xs">
                              {reg.event.eventType === "FREE" ? "Free" : `$${reg.event.price}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Link
                          href={`/events/${reg.event.id}`}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                        >
                          View Event
                        </Link>

                        {canReview && (
                          <Link
                            href={`/events/${reg.event.id}#reviews`}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-800 ml-3"
                          >
                            <Star className="w-3 h-3" />
                            Leave Review
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(reg.id, reg.event.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 ml-auto"
                          >
                            Cancel Registration
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}