// app/admin/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  Loader2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface EventData {
  id: string;
  title: string;
  banner?: string | null;
  startDate: string;
  status: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
  isOnline: boolean;
  city?: string | null;
  capacity: number;
  seatsRemaining: number;
  organizer: { id: string; name: string };
  category?: { name: string } | null;
  _count: { registrations: number };
}

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchEvents(); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let items = data.data || [];
        // Client-side status filter since API might not filter all statuses
        if (statusFilter !== "ALL") {
          items = items.filter((e: EventData) => e.status === statusFilter);
        }
        setEvents(items);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    setProcessing(eventId);
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
      alert("Failed to update event");
    } finally {
      setProcessing(null);
      setActionMenuId(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event? This cannot be undone if it has no registrations.")) return;
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch {
      alert("Failed to delete event");
    } finally {
      setProcessing(null);
      setActionMenuId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PUBLISHED: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
      DRAFT: { bg: "bg-gray-100", text: "text-gray-600", icon: <Clock className="w-3 h-3" /> },
      CANCELLED: { bg: "bg-red-100", text: "text-red-600", icon: <Ban className="w-3 h-3" /> },
      COMPLETED: { bg: "bg-blue-100", text: "text-blue-600", icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    return map[status] || map.DRAFT;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="text-sm text-gray-500 mt-1">{total} total events on the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No events found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Event</div>
            <div className="col-span-2">Organizer</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Registered</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {events.map((event) => {
              const style = getStatusStyle(event.status);
              const registered = event.capacity - event.seatsRemaining;
              return (
                <div key={event.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="lg:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {event.banner ? (
                        <img src={event.banner} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                          <CalendarDays className="w-4 h-4 text-orange-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-sm text-gray-700 truncate">{event.organizer.name}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-xs text-gray-600">{formatDate(event.startDate)}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
                      {style.icon}
                      {event.status}
                    </span>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-sm text-gray-700">
                      {event.eventType === "FREE" ? "Free" : `$${event.price}`}
                    </p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-sm text-gray-700">{registered}/{event.capacity}</p>
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-end gap-1 relative">
                    <Link
                      href={`/events/${event.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === event.id ? null : event.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {actionMenuId === event.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                            {event.status === "DRAFT" && (
                              <button onClick={() => handleStatusChange(event.id, "PUBLISHED")} disabled={processing === event.id} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 disabled:opacity-50">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Force Publish
                              </button>
                            )}
                            {event.status === "PUBLISHED" && (
                              <button onClick={() => handleStatusChange(event.id, "DRAFT")} disabled={processing === event.id} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 disabled:opacity-50">
                                <Clock className="w-3.5 h-3.5" /> Unpublish
                              </button>
                            )}
                            {event.status !== "CANCELLED" && (
                              <button onClick={() => handleStatusChange(event.id, "CANCELLED")} disabled={processing === event.id} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                                <Ban className="w-3.5 h-3.5" /> Cancel Event
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => handleDelete(event.id)} disabled={processing === event.id} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}