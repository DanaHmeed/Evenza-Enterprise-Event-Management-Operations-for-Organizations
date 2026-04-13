//app/dashboard/events/[eventId]/attendees/page.tsx
"use client";

import { useState, useCallback } from "react";
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
import { useOrganizerAttendees } from "@/hooks/use-dashboard";
import ActionToast from "@/components/modals/ActionToast";

type Filter = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

/* ─── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "#fff",
      borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
      borderRadius: 6,
      padding: "14px 18px",
      flex: "1 1 0",
      minWidth: 0,
    }}>
      <p style={{ fontSize: 20, fontWeight: 600, color, margin: 0, }}>
        {value}
      </p>
      <p style={{
        fontSize: 10, fontWeight: 700, color: t.textFaint, margin: "3px 0 0",
        textTransform: "uppercase", letterSpacing: "0.08em",}}>
        {label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function OrganizerAttendeesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; description?: string; variant: "success" | "error" } | null>(null);

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 400));
  }, [debounceTimer]);

  const { attendees, stats, pagination, isLoading, refresh } = useOrganizerAttendees({
    page, status: filter, search: debouncedSearch,
  });

  const handleApproval = async (
    att: { id: string; event: { id: string } },
    action: "APPROVED" | "REJECTED"
  ) => {
    setProcessing(att.id);
    try {
      const res = await fetch(`/api/events/${att.event.id}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: att.id, status: action }),
      });
      if (res.ok) {
        refresh();
        setToast({
          message: action === "APPROVED" ? "Attendee approved" : "Attendee rejected",
          variant: action === "APPROVED" ? "success" : "error",
        });
      } else {
        setToast({ message: "Failed to update status", variant: "error" });
      }
    } catch {
      setToast({ message: "Network error", variant: "error" });
    } finally { setProcessing(null); }
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Event", "Status", "Checked In"]];
    attendees.forEach((a: {
      user: { name: string; email: string };
      event: { title: string };
      status: string;
      checkedIn: boolean;
    }) => rows.push([a.user.name, a.user.email, a.event.title, a.status, a.checkedIn ? "Yes" : "No"]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendees.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const filters: Filter[] = ["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"];

  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
    borderRadius: 6, overflow: "hidden",
  };

  return (
    <>
      {toast && <ActionToast {...toast} duration={4000} onClose={() => setToast(null)} />}

      <div style={{minHeight: "100vh", background: "#f7f7f4" }}>

        {/* ── Sticky top bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "#fff", borderBottom: `1px solid ${t.borderLight}`,
          padding: "0 24px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
            <Link href="/dashboard" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500 }}>
              Dashboard
            </Link>
            <ChevronRight style={{ width: 13, height: 13, opacity: 0.4 }} />
            <span style={{ color: t.text, fontWeight: 600 }}>Attendees</span>
          </div>

          <button
            onClick={exportCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", fontSize: 13, fontWeight: 500,
              borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
              borderRadius: 4, background: "#fff", color: t.textSecondary,
              cursor: "pointer",
            }}
          >
            <Download style={{ width: 13, height: 13 }} />
            Export CSV
          </button>
        </div>

        {/* ── Page body ── */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
              All Attendees
            </h1>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              {stats?.total ?? 0} registration{(stats?.total ?? 0) !== 1 ? "s" : ""} across all your events
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

          {/* Filters row */}
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
                placeholder="Search name, email, or event…"
                style={{
                  width: "100%", padding: "9px 14px 9px 34px", fontSize: 13,
                  //fontFamily: "Rubik, sans-serif",
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
          {isLoading ? (
            <OrganizerLoading />
          ) : attendees.length === 0 ? (
            <OrganizerEmpty
              icon={<Users style={{ width: 32, height: 32 }} />}
              message={search || filter !== "ALL" ? "No attendees match your filters." : "No attendees yet."}
            />
          ) : (
            <div style={card}>
              {/* Header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 2fr 1fr 1fr 130px",
                gap: 8, padding: "10px 20px",
                background: t.borderLight,
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint,
              }}>
                <span>Attendee</span>
                <span>Event</span>
                <span>Status</span>
                <span>Check-in</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {attendees.map((att: {
                id: string;
                status: string;
                checkedIn: boolean;
                createdAt: string;
                user: { id: string; name: string; email: string; avatar?: string | null };
                event: { id: string; title: string };
                ticket?: { ticketNumber: string } | null;
              }, i: number) => (
                <div
                  key={att.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.5fr 2fr 1fr 1fr 130px",
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
                      <img src={att.user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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

                  {/* Event link */}
                  <Link
                    href={`/dashboard/events/${att.event.id}/attendees`}
                    style={{ fontSize: 13, color: t.textSecondary, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = t.accent)}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = t.textSecondary)}
                  >
                    {att.event.title}
                  </Link>

                  {/* Status */}
                  <StatusBadge status={att.status} />

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
                          onClick={() => handleApproval(att, "APPROVED")}
                          disabled={processing === att.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
                            //fontFamily: "Rubik, sans-serif",
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
                          onClick={() => handleApproval(att, "REJECTED")}
                          disabled={processing === att.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
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
            totalPages={pagination?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}