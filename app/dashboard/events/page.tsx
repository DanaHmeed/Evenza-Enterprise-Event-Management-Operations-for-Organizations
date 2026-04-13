"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  ChevronRight,
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
import ActionToast from "@/components/modals/ActionToast";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";

/* ═══════════════════════════════════════════════════════════════════════
   Dropdown menu — rendered in a portal to avoid z-index clipping
═══════════════════════════════════════════════════════════════════════ */
function EventMenu({
  eventId,
  status,
  processing,
  onClose,
  onPatch,
  onDelete,
  anchorRef,
}: {
  eventId: string;
  status: string;
  processing: string | null;
  onClose: () => void;
  onPatch: (id: string, s: string) => void;
  onDelete: (id: string) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
    }
  }, [anchorRef]);

  const busy = processing === eventId;

  return (
    <>
      {/* backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 998 }}
        onClick={onClose}
      />
      {/* menu */}
      <div
        style={{
          position: "absolute",
          top: pos.top,
          right: pos.right,
          width: 168,
          background: "#fff",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: t.border,
          borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 999,
          padding: "4px 0",
          fontFamily: "Rubik, sans-serif",
        }}
      >
        <MenuBtn
          icon={<Pencil />}
          label="Edit"
          color={t.textSecondary}
          href={`/dashboard/events/${eventId}/edit`}
          onClick={onClose}
        />
        {status === "DRAFT" && (
          <MenuBtn
            icon={<CheckCircle2 />}
            label="Publish"
            color={t.green}
            onClick={() => onPatch(eventId, "PUBLISHED")}
            disabled={busy}
          />
        )}
        {status === "PUBLISHED" && (
          <MenuBtn
            icon={<Clock />}
            label="Unpublish"
            color={t.amber}
            onClick={() => onPatch(eventId, "DRAFT")}
            disabled={busy}
          />
        )}
        {status !== "CANCELLED" && (
          <MenuBtn
            icon={<Ban />}
            label="Cancel"
            color={t.red}
            onClick={() => onPatch(eventId, "CANCELLED")}
            disabled={busy}
          />
        )}
        <div style={{ height: 1, background: t.borderLight, margin: "4px 0" }} />
        <MenuBtn
          icon={<Trash2 />}
          label="Delete"
          color={t.red}
          onClick={() => onDelete(eventId)}
          disabled={busy}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
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
  const [toast, setToast] = useState<{ message: string; description?: string; variant: "success" | "error" } | null>(null);
  const menuBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const createdStatus = searchParams.get("created");

  // Show toast once on redirect from create
  const [shownCreatedToast, setShownCreatedToast] = useState(false);
  useEffect(() => {
    if (createdStatus && !shownCreatedToast) {
      setToast({
        message: createdStatus === "draft" ? "Draft saved" : "Event published!",
        description: createdStatus === "draft"
          ? "Your event was saved as a draft."
          : "Your event is now live.",
        variant: "success",
      });
      setShownCreatedToast(true);
    }
  }, [createdStatus, shownCreatedToast]);

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 400));
  }, [debounceTimer]);

  const { events, pagination, isLoading, refresh } = useOrganizerEvents({
    page, status, search: debouncedSearch,
  });

  const patchStatus = async (eventId: string, newStatus: string) => {
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { refresh(); setMenuId(null); }
      else setToast({ message: "Failed to update status", variant: "error" });
    } catch {
      setToast({ message: "Network error", variant: "error" });
    } finally { setProcessing(null); }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setProcessing(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) { refresh(); setMenuId(null); setToast({ message: "Event deleted", variant: "success" }); }
      else setToast({ message: "Failed to delete event", variant: "error" });
    } catch {
      setToast({ message: "Network error", variant: "error" });
    } finally { setProcessing(null); }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filters: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"];

  /* ── shared card style ── */
  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: t.borderLight,
    borderRadius: 6,
    overflow: "hidden",
  };

  return (
    <>
      {toast && <ActionToast {...toast} duration={4000} onClose={() => setToast(null)} />}

      <div style={{ fontFamily: "Rubik, sans-serif", minHeight: "100vh", background: "#f7f7f4" }}>

        {/* ── Sticky top bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "#fff", borderBottom: `1px solid ${t.borderLight}`,
          padding: "0 24px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
            <Link href="/dashboard" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500 }}>
              Dashboard
            </Link>
            <ChevronRight style={{ width: 13, height: 13, opacity: 0.4 }} />
            <span style={{ color: t.text, fontWeight: 600 }}>My Events</span>
          </div>

          {/* Create button */}
          <Link
            href="/dashboard/events/create"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px", fontSize: 13, fontWeight: 600,
              fontFamily: "Rubik, sans-serif",
              color: "#fff", background: t.text, borderRadius: 4,
              textDecoration: "none",
            }}
          >
            <CalendarPlus style={{ width: 14, height: 14 }} />
            Create Event
          </Link>
        </div>

        {/* ── Page body ── */}
        <div style={{ maxWidth: 1260, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: "Rubik, sans-serif", fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
              My Events
            </h1>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              {pagination.total ?? 0} event{pagination.total !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* Filters row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 320 }}>
              <Search style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                width: 14, height: 14, color: t.textFaint,
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search events…"
                style={{
                  width: "100%", padding: "9px 14px 9px 34px", fontSize: 13,
                  fontFamily: "Rubik, sans-serif",
                  borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
                  borderRadius: 4, outline: "none", color: t.text, background: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Status filters */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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

          {/* Table */}
          {isLoading ? (
            <OrganizerLoading />
          ) : events.length === 0 ? (
            <OrganizerEmpty
              icon={<CalendarDays style={{ width: 32, height: 32 }} />}
              message={search || status !== "ALL" ? "No events match your filters." : "Create your first event to get started."}
              action={
                <Link href="/dashboard/events/create" style={{ fontSize: 13, fontWeight: 600, color: t.accent, textDecoration: "none" }}>
                  Create Event →
                </Link>
              }
            />
          ) : (
            <div style={card}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1.5fr 88px",
                gap: 8, padding: "10px 20px",
                background: t.borderLight,
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em", color: t.textFaint,
              }}>
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
                      display: "grid",
                      gridTemplateColumns: "3fr 1fr 1fr 1.5fr 88px",
                      gap: 8, padding: "12px 20px", alignItems: "center",
                      borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Event info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 4, overflow: "hidden",
                        background: t.borderLight, flexShrink: 0,
                      }}>
                        {event.banner ? (
                          <img src={event.banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CalendarDays style={{ width: 14, height: 14, color: t.textFaint }} />
                          </div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {event.title}
                        </p>
                        <p style={{ fontSize: 11, color: t.textFaint, margin: 0 }}>
                          {event.category?.name || "—"} · {event.eventType === "FREE" ? "Free" : `$${event.price}`}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <span style={{ fontSize: 12, color: t.textMuted }}>{fmtDate(event.startDate)}</span>

                    {/* Status */}
                    <StatusBadge status={event.status} />

                    {/* Capacity bar */}
                    <div>
                      <span style={{ fontSize: 12, color: t.textMuted, fontVariantNumeric: "tabular-nums" }}>
                        {registered}/{event.capacity}
                      </span>
                      <div style={{ width: "100%", maxWidth: 100, height: 3, background: t.borderLight, borderRadius: 2, marginTop: 4 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 90 ? t.red : t.accent, borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                      <Link
                        href={`/events/${event.id}`}
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, borderRadius: 4, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="View event"
                      >
                        <ExternalLink style={{ width: 13, height: 13 }} />
                      </Link>
                      <Link
                        href={`/dashboard/events/${event.id}/attendees`}
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, borderRadius: 4, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="View attendees"
                      >
                        <Users style={{ width: 13, height: 13 }} />
                      </Link>

                      {/* ⋯ menu trigger */}
                      <button
                        ref={(el) => {
                          if (el) menuBtnRefs.current.set(event.id, el);
                          else menuBtnRefs.current.delete(event.id);
                        }}
                        onClick={() => setMenuId(menuId === event.id ? null : event.id)}
                        style={{
                          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                          border: "none", background: "transparent", color: t.textFaint,
                          cursor: "pointer", borderRadius: 4,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.borderLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        title="More actions"
                      >
                        <MoreHorizontal style={{ width: 14, height: 14 }} />
                      </button>

                      {menuId === event.id && (
                        <EventMenu
                          eventId={event.id}
                          status={event.status}
                          processing={processing}
                          onClose={() => setMenuId(null)}
                          onPatch={patchStatus}
                          onDelete={deleteEvent}
                          anchorRef={{ current: menuBtnRefs.current.get(event.id) ?? null }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <OrganizerPagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}

/* ─── MenuBtn ──────────────────────────────────────────────────────────── */
function MenuBtn({
  icon, label, color, href, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; color: string;
  href?: string; onClick?: () => void; disabled?: boolean;
}) {
  const style: React.CSSProperties = {
    width: "100%", display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px", fontSize: 13, color,
    background: "transparent", border: "none",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "Rubik, sans-serif",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
  };
  const hover = (e: React.MouseEvent) => {
    if (!disabled) (e.currentTarget as HTMLElement).style.background = "#f5f5f1";
  };
  const leave = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };

  if (href) {
    return (
      <Link href={href} style={style} onMouseEnter={hover} onMouseLeave={leave} onClick={onClick}>
        <span style={{ width: 13, height: 13, display: "flex", flexShrink: 0 }}>{icon}</span>
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} style={style} onMouseEnter={hover} onMouseLeave={leave}>
      <span style={{ width: 13, height: 13, display: "flex", flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}