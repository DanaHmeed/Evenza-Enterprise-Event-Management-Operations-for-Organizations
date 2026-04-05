// app/dashboard/events/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  CalendarDays,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  ExternalLink,
  CheckCircle2,
  Clock,
  Ban,
} from "lucide-react";
import {
  t,
  StatusBadge,
  OrganizerPagination,
  OrganizerLoading,
  OrganizerEmpty,
  FilterButton,
} from "@/components/dashboard/OrganizerUI";
import { useOrganizerEvents } from "@/hooks/use-dashboard";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

export default function MyEventsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "ALL"
  );
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const createdStatus = searchParams.get("created");

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400)
    );
  }, [debounceTimer]);

  // SWR-cached — instant on re-navigation, background refresh
  const { events, pagination, isLoading, refresh } = useOrganizerEvents({
    page,
    status,
    search: debouncedSearch,
  });

  const patchStatus = async (eventId: string, newStatus: string) => {
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) refresh();
    } catch {
      alert("Failed");
    } finally {
      setProcessing(null);
      setMenuId(null);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch {
      alert("Failed");
    } finally {
      setProcessing(null);
      setMenuId(null);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filters: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>
            My Events
          </h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
            {pagination.total} events total.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", fontSize: "13px", fontWeight: 600,
            color: "#fff", background: t.text, borderRadius: "4px",
            textDecoration: "none", fontFamily: t.sans,
          }}
        >
          <CalendarPlus style={{ width: "14px", height: "14px" }} /> Create Event
        </Link>
      </div>

      {/* Created toast */}
      {createdStatus && (
        <div style={{ marginBottom: "16px", padding: "10px 16px", background: t.greenSoft, borderRadius: "4px", fontSize: "13px", fontWeight: 500, color: t.green, display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
          Event {createdStatus === "draft" ? "saved as draft" : "published"} successfully!
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search events..."
            style={{
              width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px",
              fontFamily: t.sans, border: `1px solid ${t.border}`, borderRadius: "4px",
              outline: "none", color: t.text, background: t.surface,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {filters.map((s) => (
            <FilterButton
              key={s}
              label={s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              active={status === s}
              onClick={() => { setStatus(s); setPage(1); }}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <OrganizerLoading />
      ) : events.length === 0 ? (
        <OrganizerEmpty
          icon={<CalendarDays style={{ width: "32px", height: "32px" }} />}
          message={search || status !== "ALL" ? "No events match your filters." : "Create your first event to get started."}
          action={
            <Link href="/dashboard/events/create" style={{ fontSize: "13px", fontWeight: 600, color: t.accent, textDecoration: "none" }}>
              Create Event →
            </Link>
          }
        />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", overflow: "hidden" }}>
          <div
            className="hidden lg:grid"
            style={{
              gridTemplateColumns: "3fr 1fr 1fr 1.5fr 80px",
              gap: "8px", padding: "10px 20px", background: t.borderLight,
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: t.textFaint,
            }}
          >
            <span>Event</span>
            <span>Date</span>
            <span>Status</span>
            <span>Capacity</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {events.map((event: {
            id: string; title: string; banner?: string | null; startDate: string;
            status: string; eventType: string; price?: number | null;
            capacity: number; seatsRemaining: number;
            category?: { name: string; color?: string | null } | null;
            _count: { registrations: number; feedbacks: number };
          }, i: number) => {
            const registered = event.capacity - event.seatsRemaining;
            const pct = event.capacity > 0 ? Math.min((registered / event.capacity) * 100, 100) : 0;
            return (
              <div
                key={event.id}
                style={{
                  display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1.5fr 80px",
                  gap: "8px", padding: "12px 20px", alignItems: "center",
                  borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                  transition: "background 0.1s",
                }}
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
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>
                      {event.category?.name || "—"} · {event.eventType === "FREE" ? "Free" : `$${event.price}`}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: "12px", color: t.textMuted }}>{fmtDate(event.startDate)}</span>
                <StatusBadge status={event.status} />

                {/* Capacity bar */}
                <div>
                  <span style={{ fontSize: "12px", color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>
                    {registered}/{event.capacity}
                  </span>
                  <div style={{ width: "100%", maxWidth: "100px", height: "3px", background: t.borderLight, borderRadius: "2px", marginTop: "4px" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? t.red : t.accent, borderRadius: "2px", transition: "width 0.3s" }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "2px", position: "relative" }}>
                  <Link
                    href={`/events/${event.id}`}
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, borderRadius: "4px", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ExternalLink style={{ width: "13px", height: "13px" }} />
                  </Link>
                  <Link
                    href={`/dashboard/events/${event.id}/attendees`}
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, borderRadius: "4px", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Users style={{ width: "13px", height: "13px" }} />
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
                        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", width: "160px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 20, padding: "4px 0", fontFamily: t.sans }}>
                          <MenuBtn icon={<Pencil />} label="Edit" color={t.textSecondary} href={`/dashboard/events/${event.id}/edit`} onClick={() => setMenuId(null)} />
                          {event.status === "DRAFT" && (
                            <MenuBtn icon={<CheckCircle2 />} label="Publish" color={t.green} onClick={() => patchStatus(event.id, "PUBLISHED")} disabled={processing === event.id} />
                          )}
                          {event.status === "PUBLISHED" && (
                            <MenuBtn icon={<Clock />} label="Unpublish" color={t.amber} onClick={() => patchStatus(event.id, "DRAFT")} disabled={processing === event.id} />
                          )}
                          {event.status !== "CANCELLED" && (
                            <MenuBtn icon={<Ban />} label="Cancel" color={t.red} onClick={() => patchStatus(event.id, "CANCELLED")} disabled={processing === event.id} />
                          )}
                          <div style={{ height: "1px", background: t.borderLight, margin: "4px 0" }} />
                          <MenuBtn icon={<Trash2 />} label="Delete" color={t.red} onClick={() => deleteEvent(event.id)} disabled={processing === event.id} />
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

      <OrganizerPagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}

function MenuBtn({
  icon, label, color, href, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; color: string;
  href?: string; onClick?: () => void; disabled?: boolean;
}) {
  const style: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 12px", fontSize: "13px", color, background: "transparent",
    border: "none", cursor: disabled ? "default" : "pointer",
    fontFamily: "'DM Sans', sans-serif", opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
  };
  const hover = (e: React.MouseEvent) => {
    if (!disabled) (e.currentTarget as HTMLElement).style.background = "#f0f0ec";
  };
  const leave = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };

  if (href) {
    return (
      <Link href={href} style={style} onMouseEnter={hover} onMouseLeave={leave} onClick={onClick}>
        <span style={{ width: "13px", height: "13px", display: "flex" }}>{icon}</span>{label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} style={style} onMouseEnter={hover} onMouseLeave={leave}>
      <span style={{ width: "13px", height: "13px", display: "flex" }}>{icon}</span>{label}
    </button>
  );
}