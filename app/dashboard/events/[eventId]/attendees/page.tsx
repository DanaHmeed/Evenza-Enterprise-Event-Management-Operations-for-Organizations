"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  CheckCircle2,
  UserCheck,
  UserX,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import {
  t,
  StatusBadge,
  FilterButton,
  OrganizerLoading,
  OrganizerEmpty,
  OrganizerPagination,
} from "@/components/dashboard/OrganizerUI";
import ActionToast from "@/components/modals/ActionToast";

type Filter = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

interface Attendee {
  id: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
  ticket?: { ticketNumber: string; status: string } | null;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  checkedIn: number;
}

/* ─── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "#fff",
      borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
      borderRadius: 6, padding: "14px 18px",
      flex: "1 1 0", minWidth: 0,
    }}>
      <p style={{ fontSize: 20, fontWeight: 600, color, margin: 0, fontFamily: "Rubik, sans-serif" }}>
        {value}
      </p>
      <p style={{
        fontSize: 10, fontWeight: 700, color: t.textFaint, margin: "3px 0 0",
        textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Rubik, sans-serif",
      }}>
        {label}
      </p>
    </div>
  );
}

const PAGE_SIZE = 20;

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function EventAttendeesPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [attendees, setAttendees]   = useState<Attendee[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast]           = useState<{ message: string; description?: string; variant: "success" | "error" } | null>(null);

  const [search, setSearch]                       = useState("");
  const [debouncedSearch, setDebouncedSearch]     = useState("");
  const [filter, setFilter]                       = useState<Filter>("ALL");
  const [page, setPage]                           = useState(1);
  const [totalPages, setTotalPages]               = useState(1);
  const [total, setTotal]                         = useState(0);

  /* ── debounce ── */
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 400));
  }, [debounceTimer]);

  /* ── fetch event title once ── */
  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setEventTitle(d.data?.title || "Event"); });
  }, [eventId]);

  /* ── fetch attendees ── */
  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        ...(filter !== "ALL" && { status: filter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/events/${eventId}/attendees?${qs}`);
      if (!res.ok) return;
      const d = await res.json();
      setAttendees(d.data?.attendees || []);
      setStats(d.data?.stats || null);
      setTotal(d.data?.pagination?.total ?? d.data?.attendees?.length ?? 0);
      setTotalPages(d.data?.pagination?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [eventId, page, filter, debouncedSearch]);

  useEffect(() => { fetchAttendees(); }, [fetchAttendees]);

  /* ── approve / reject ── */
  const handleApproval = async (regId: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(regId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, status: action }),
      });
      if (res.ok) {
        fetchAttendees();
        setToast({
          message: action === "APPROVED" ? "Attendee approved" : "Attendee rejected",
          description: action === "APPROVED" ? "Ticket has been issued." : "A seat has been freed.",
          variant: action === "APPROVED" ? "success" : "error",
        });
      } else {
        setToast({ message: "Failed to update", variant: "error" });
      }
    } catch {
      setToast({ message: "Network error", variant: "error" });
    } finally { setProcessing(null); }
  };

  /* ── export CSV ── */
  const exportCSV = () => {
    const rows = [["Name", "Email", "Status", "Ticket", "Checked In", "Date"]];
    attendees.forEach((a) => rows.push([
      a.user.name, a.user.email, a.status,
      a.ticket?.ticketNumber || "—",
      a.checkedIn ? "Yes" : "No",
      new Date(a.createdAt).toLocaleDateString(),
    ]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement("a");
    el.href = url; el.download = `attendees-${eventId}.csv`; el.click();
    URL.revokeObjectURL(url);
  };

  const filters: Filter[] = ["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"];

  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
    borderRadius: 6, overflow: "hidden",
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted, minWidth: 0 }}>
            <Link href="/dashboard/events" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500, flexShrink: 0 }}>
              Events
            </Link>
            <ChevronRight style={{ width: 13, height: 13, opacity: 0.4, flexShrink: 0 }} />
            <Link
              href={`/dashboard/events/${eventId}/edit`}
              style={{
                color: t.textMuted, textDecoration: "none", fontWeight: 500,
                maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {eventTitle || "…"}
            </Link>
            <ChevronRight style={{ width: 13, height: 13, opacity: 0.4, flexShrink: 0 }} />
            <span style={{ color: t.text, fontWeight: 600, flexShrink: 0 }}>Attendees</span>
          </div>

          <button
            onClick={exportCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", fontSize: 13, fontWeight: 500,
              fontFamily: "Rubik, sans-serif",
              borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
              borderRadius: 4, background: "#fff", color: t.textSecondary,
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <Download style={{ width: 13, height: 13 }} />
            Export CSV
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: "Rubik, sans-serif", fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
              Attendees
            </h1>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              {total} registration{total !== 1 ? "s" : ""} for{" "}
              <span style={{ fontWeight: 600, color: t.text }}>{eventTitle}</span>
            </p>
          </div>

          {/* Stat tiles */}
          {stats && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <StatTile label="Total"      value={stats.total}     color={t.text}      />
              <StatTile label="Approved"   value={stats.approved}  color={t.green}     />
              <StatTile label="Pending"    value={stats.pending}   color={t.amber}     />
              <StatTile label="Rejected"   value={stats.rejected}  color={t.red}       />
              <StatTile label="Cancelled"  value={stats.cancelled} color={t.textFaint} />
              <StatTile label="Checked In" value={stats.checkedIn} color={t.accent}    />
            </div>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 340 }}>
              <Search style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                width: 14, height: 14, color: t.textFaint, pointerEvents: "none",
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name or email…"
                style={{
                  width: "100%", padding: "9px 14px 9px 34px", fontSize: 13,
                  fontFamily: "Rubik, sans-serif",
                  borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
                  borderRadius: 4, outline: "none", color: t.text, background: "#fff",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {filters.map((f) => (
                <FilterButton
                  key={f}
                  label={f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  active={filter === f}
                  onClick={() => { setFilter(f); setPage(1); }}
                />
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <OrganizerLoading />
          ) : attendees.length === 0 ? (
            <OrganizerEmpty
              icon={<Users style={{ width: 32, height: 32 }} />}
              message={search || filter !== "ALL" ? "No attendees match your filters." : "No registrations yet."}
            />
          ) : (
            <div style={card}>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1.5fr 1fr 130px",
                gap: 8, padding: "10px 20px",
                background: t.borderLight,
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint,
              }}>
                <span>Attendee</span>
                <span>Status</span>
                <span>Ticket</span>
                <span>Check-in</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {attendees.map((att, i) => (
                <div
                  key={att.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr 1.5fr 1fr 130px",
                    gap: 8, padding: "12px 20px", alignItems: "center",
                    borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* User */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    {att.user.avatar ? (
                      <img
                        src={att.user.avatar} alt=""
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: t.accentSoft, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: t.accent,
                      }}>
                        {att.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {att.user.name}
                      </p>
                      <p style={{ fontSize: 11, color: t.textFaint, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {att.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={att.status} />

                  {/* Ticket number */}
                  <span style={{ fontSize: 12, color: t.textMuted, fontFamily: "monospace" }}>
                    {att.ticket?.ticketNumber || "—"}
                  </span>

                  {/* Check-in */}
                  {att.checkedIn ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.green, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 style={{ width: 12, height: 12 }} /> Yes
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: t.textFaint }}>—</span>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                    {att.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApproval(att.id, "APPROVED")}
                          disabled={processing === att.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
                            fontFamily: "Rubik, sans-serif",
                            color: t.green, background: t.greenSoft,
                            border: "none", borderRadius: 3,
                            cursor: processing === att.id ? "default" : "pointer",
                            opacity: processing === att.id ? 0.5 : 1,
                          }}
                        >
                          {processing === att.id
                            ? <Loader2 className="animate-spin" style={{ width: 11, height: 11 }} />
                            : <UserCheck style={{ width: 11, height: 11 }} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(att.id, "REJECTED")}
                          disabled={processing === att.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
                            fontFamily: "Rubik, sans-serif",
                            color: t.red, background: t.redSoft,
                            border: "none", borderRadius: 3,
                            cursor: processing === att.id ? "default" : "pointer",
                            opacity: processing === att.id ? 0.5 : 1,
                          }}
                        >
                          <UserX style={{ width: 11, height: 11 }} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <OrganizerPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}