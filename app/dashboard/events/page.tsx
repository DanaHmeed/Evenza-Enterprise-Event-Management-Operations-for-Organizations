// app/dashboard/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Users,
  MoreHorizontal,
  Loader2,
  CalendarX,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ExternalLink,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug?: string;
  banner?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
  isOnline: boolean;
  city?: string | null;
  capacity: number;
  seatsRemaining: number;
  category?: { name: string } | null;
  _count: { registrations: number; feedbacks: number };
}

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

export default function MyEventsPage() {
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Show created toast
  const createdStatus = searchParams.get("created");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?pageSize=100&sortBy=createdAt&sortOrder=desc");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || []);
      }
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch {
      alert("Failed to delete event");
    } finally {
      setDeleting(null);
      setActionMenuId(null);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
        );
      }
    } catch {
      alert("Failed to update status");
    }
    setActionMenuId(null);
  };

  // Filter & search
  const filtered = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: events.length,
    PUBLISHED: events.filter((e) => e.status === "PUBLISHED").length,
    DRAFT: events.filter((e) => e.status === "DRAFT").length,
    CANCELLED: events.filter((e) => e.status === "CANCELLED").length,
    COMPLETED: events.filter((e) => e.status === "COMPLETED").length,
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PUBLISHED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
      DRAFT: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-600",
        icon: <Ban className="w-3.5 h-3.5" />,
      },
      COMPLETED: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
    };
    return map[status] || map.DRAFT;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your events.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Created toast */}
      {createdStatus && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          Event {createdStatus === "draft" ? "saved as draft" : "published"} successfully!
        </div>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"] as StatusFilter[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
              <span className="ml-1.5 text-xs opacity-70">
                ({statusCounts[status]})
              </span>
            </button>
          )
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <CalendarX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No events found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery || statusFilter !== "ALL"
              ? "Try adjusting your filters."
              : "Create your first event to get started."}
          </p>
          <Link
            href="/dashboard/events/create"
            className="text-sm text-orange-600 font-semibold hover:underline"
          >
            Create Event →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Event</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Registrations</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map((event) => {
              const style = getStatusStyle(event.status);
              const registered = event.capacity - event.seatsRemaining;
              return (
                <div
                  key={event.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                >
                  {/* Event info */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {event.banner ? (
                        <img
                          src={event.banner}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                          <CalendarPlus className="w-5 h-5 text-orange-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.category && (
                          <span className="text-xs text-gray-500">
                            {event.category.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {event.eventType === "FREE" ? "Free" : `$${event.price}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-700">{formatDate(event.startDate)}</p>
                    <p className="text-xs text-gray-400">
                      {event.isOnline ? "Online" : event.city || "In-person"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}
                    >
                      {style.icon}
                      {event.status}
                    </span>
                  </div>

                  {/* Registrations */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {registered} / {event.capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 max-w-[120px]">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${Math.min((registered / event.capacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1 relative">
                    <Link
                      href={`/events/${event.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/events/${event.id}/attendees`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title="Attendees"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuId(actionMenuId === event.id ? null : event.id)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {actionMenuId === event.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                            <Link
                              href={`/dashboard/events/${event.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setActionMenuId(null)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit Event
                            </Link>

                            {event.status === "DRAFT" && (
                              <button
                                onClick={() => handleStatusChange(event.id, "PUBLISHED")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Publish
                              </button>
                            )}

                            {event.status === "PUBLISHED" && (
                              <button
                                onClick={() => handleStatusChange(event.id, "DRAFT")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Unpublish
                              </button>
                            )}

                            {event.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleStatusChange(event.id, "CANCELLED")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Cancel Event
                              </button>
                            )}

                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={deleting === event.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              {deleting === event.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}