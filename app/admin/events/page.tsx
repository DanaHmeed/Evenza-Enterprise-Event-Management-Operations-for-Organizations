// app/admin/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { t, StatusBadge, AdminPagination, AdminEmpty, AdminLoading } from "@/components/admin/AdminUI";

interface EventData {
  id: string;
  title: string;
  banner?: string | null;
  startDate: string;
  status: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
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
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchDebounced, statusFilter]);

  // Single fetch effect
  useEffect(() => {
    fetchEvents();
  }, [page, searchDebounced, statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      params.set("sortBy", "createdAt");
      params.set("sortOrder", "desc");
      params.set("all", "true");
      if (searchDebounced) params.set("search", searchDebounced);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch { /* */ } finally {
      setLoading(false);
    }
  };

  const patchEvent = async (eventId: string, body: Record<string, unknown>) => {
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...body } as EventData : e)));
      }
    } catch { alert("Failed to update event"); }
    finally { setProcessing(null); setMenuId(null); }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch { alert("Failed to delete event"); }
    finally { setProcessing(null); setMenuId(null); }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filters: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"];

  return (
    <div style={{ fontFamily: 'Quicksand' }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: 'Quicksand', fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Events</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>{total} total events on the platform.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px", fontFamily: 'Quicksand', border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 500, fontFamily: 'Quicksand',
                border: `1px solid ${statusFilter === s ? t.text : t.border}`, borderRadius: "4px",
                background: statusFilter === s ? t.text : t.surface,
                color: statusFilter === s ? "#fff" : t.textMuted, cursor: "pointer",
              }}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? <AdminLoading /> : events.length === 0 ? (
        <AdminEmpty icon={<CalendarDays style={{ width: "32px", height: "32px" }} />} message="No events found." />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", overflow: "hidden" }}>
          <div
            className="hidden lg:grid"
            style={{ gridTemplateColumns: "3fr 1.5fr 1fr 1fr 1fr 80px", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}
          >
            <span>Event</span><span>Organizer</span><span>Date</span><span>Status</span><span>Capacity</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {events.map((event, i) => {
            const registered = event.capacity - event.seatsRemaining;
            return (
              <div
                key={event.id}
                style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1fr 1fr 1fr 80px", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition: "background 0.1s" }}
                className="grid-cols-1 lg:grid-cols-none"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Event */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "4px", overflow: "hidden", background: t.borderLight, flexShrink: 0 }}>
                    {event.banner ? (
                      <img src={event.banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CalendarDays style={{ width: "14px", height: "14px", color: t.textFaint }} />
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>
                      {event.category?.name || "—"} · {event.eventType === "FREE" ? "Free" : `$${event.price}`}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: "12px", color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.organizer.name}</span>
                <span style={{ fontSize: "12px", color: t.textMuted }}>{fmtDate(event.startDate)}</span>
                <StatusBadge status={event.status} />
                <span style={{ fontSize: "12px", color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>{registered}/{event.capacity}</span>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "2px", position: "relative" }}>
                  <Link
                    href={`/events/${event.id}`}
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, borderRadius: "4px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ExternalLink style={{ width: "13px", height: "13px" }} />
                  </Link>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setMenuId(menuId === event.id ? null : event.id)}
                      style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: t.textFaint, cursor: "pointer", borderRadius: "4px" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <MoreHorizontal style={{ width: "14px", height: "14px" }} />
                    </button>

                    {menuId === event.id && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setMenuId(null)} />
                        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", width: "160px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 20, padding: "4px 0", fontFamily: 'Quicksand' }}>
                          {event.status === "DRAFT" && (
                            <MenuItem icon={<CheckCircle2 />} label="Publish" color={t.green} onClick={() => patchEvent(event.id, { status: "PUBLISHED" })} disabled={processing === event.id} />
                          )}
                          {event.status === "PUBLISHED" && (
                            <MenuItem icon={<Clock />} label="Unpublish" color={t.amber} onClick={() => patchEvent(event.id, { status: "DRAFT" })} disabled={processing === event.id} />
                          )}
                          {event.status !== "CANCELLED" && (
                            <MenuItem icon={<Ban />} label="Cancel" color={t.accent} onClick={() => patchEvent(event.id, { status: "CANCELLED" })} disabled={processing === event.id} />
                          )}
                          <div style={{ height: "1px", background: t.borderLight, margin: "4px 0" }} />
                          <MenuItem icon={<Trash2 />} label="Delete" color={t.accent} onClick={() => deleteEvent(event.id)} disabled={processing === event.id} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

// Reusable menu item to reduce repetition
function MenuItem({ icon, label, color, onClick, disabled }: { icon: React.ReactNode; label: string; color: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "13px", color, background: "transparent", border: "none", cursor: disabled ? "default" : "pointer", fontFamily: 'Quicksand ', opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = "#f0f0ec"; }}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ width: "13px", height: "13px", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}