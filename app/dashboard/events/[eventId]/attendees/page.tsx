// app/dashboard/events/[eventId]/attendees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  UserCheck,
  UserX,
  ScanLine,
  Download,
} from "lucide-react";
import { t, StatusBadge, OrganizerLoading, OrganizerEmpty, FilterButton } from "@/components/dashboard/OrganizerUI";

interface Attendee {
  id: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
  ticket?: { ticketNumber: string; status: string } | null;
}

interface Stats { total: number; approved: number; pending: number; rejected: number; cancelled: number; checkedIn: number; }

type Filter = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/events/${eventId}/attendees`).then((r) => r.ok ? r.json() : null),
    ]).then(([eventData, attData]) => {
      if (eventData) setEventTitle(eventData.data?.title || "Event");
      if (attData) {
        setAttendees(attData.data?.attendees || []);
        setStats(attData.data?.stats || null);
      }
    }).finally(() => setLoading(false));
  }, [eventId]);

  const handleApproval = async (regId: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(regId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, status: action }),
      });
      if (res.ok) {
        // Refetch
        const r = await fetch(`/api/events/${eventId}/attendees`);
        if (r.ok) { const d = await r.json(); setAttendees(d.data?.attendees || []); setStats(d.data?.stats || null); }
      }
    } catch { alert("Failed"); }
    finally { setProcessing(null); }
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Status", "Ticket", "Checked In", "Date"]];
    attendees.forEach((a) => rows.push([a.user.name, a.user.email, a.status, a.ticket?.ticketNumber || "—", a.checkedIn ? "Yes" : "No", new Date(a.createdAt).toLocaleDateString()]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `attendees-${eventId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = attendees.filter((a) => {
    const matchSearch = a.user.name.toLowerCase().includes(search.toLowerCase()) || a.user.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "ALL" || a.status === filter);
  });

  const filters: Filter[] = ["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <Link href="/dashboard/events" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", border: `1px solid ${t.borderLight}`, color: t.textMuted, textDecoration: "none" }}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Attendees</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>{eventTitle}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href={`/dashboard/scanner?eventId=${eventId}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 500, fontFamily: t.sans, color: t.textSecondary, background: "transparent", border: `1px solid ${t.border}`, borderRadius: "4px", textDecoration: "none" }}>
            <ScanLine style={{ width: "14px", height: "14px" }} /> Scanner
          </Link>
          <button onClick={exportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 500, fontFamily: t.sans, color: t.textSecondary, background: "transparent", border: `1px solid ${t.border}`, borderRadius: "4px", cursor: "pointer" }}>
            <Download style={{ width: "14px", height: "14px" }} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1px", background: t.borderLight, borderRadius: "4px", overflow: "hidden", marginBottom: "24px" }}>
          {[
            { label: "Total", value: stats.total, color: t.text },
            { label: "Approved", value: stats.approved, color: t.green },
            { label: "Pending", value: stats.pending, color: t.amber },
            { label: "Rejected", value: stats.rejected, color: t.red },
            { label: "Cancelled", value: stats.cancelled, color: t.textFaint },
            { label: "Checked In", value: stats.checkedIn, color: t.blue },
          ].map((s, i) => (
            <div key={i} style={{ background: t.surface, padding: "16px 0", textAlign: "center" }}>
              <p style={{ fontFamily: t.serif, fontSize: "20px", fontWeight: 600, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "2px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px", fontFamily: t.sans, border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }} />
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {filters.map((f) => <FilterButton key={f} label={f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} active={filter === f} onClick={() => setFilter(f)} />)}
        </div>
      </div>

      {/* Table */}
      {loading ? <OrganizerLoading /> : filtered.length === 0 ? (
        <OrganizerEmpty icon={<Users style={{ width: "32px", height: "32px" }} />} message="No attendees found." />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", overflow: "hidden" }}>
          <div className="hidden md:grid" style={{ gridTemplateColumns: "3fr 1fr 1.5fr 1fr 120px", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}>
            <span>Attendee</span><span>Status</span><span>Ticket</span><span>Check-in</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {filtered.map((att, i) => (
            <div key={att.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr 1fr 120px", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition: "background 0.1s" }} className="grid-cols-1 md:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                {att.user.avatar ? (
                  <img src={att.user.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: t.accent }}>
                    {att.user.name.charAt(0)}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.user.name}</p>
                  <p style={{ fontSize: "11px", color: t.textFaint, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.user.email}</p>
                </div>
              </div>

              <StatusBadge status={att.status} />

              <span style={{ fontSize: "12px", color: t.textMuted, fontFamily: "monospace" }}>
                {att.ticket?.ticketNumber || "—"}
              </span>

              {att.checkedIn ? (
                <span style={{ fontSize: "11px", fontWeight: 600, color: t.green, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Yes
                </span>
              ) : (
                <span style={{ fontSize: "11px", color: t.textFaint }}>No</span>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                {att.status === "PENDING" && (
                  <>
                    <button onClick={() => handleApproval(att.id, "APPROVED")} disabled={processing === att.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.green, background: t.greenSoft, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === att.id ? 0.5 : 1 }}>
                      {processing === att.id ? <Loader2 className="animate-spin" style={{ width: "11px", height: "11px" }} /> : <UserCheck style={{ width: "11px", height: "11px" }} />}
                      Approve
                    </button>
                    <button onClick={() => handleApproval(att.id, "REJECTED")} disabled={processing === att.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.red, background: t.redSoft, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === att.id ? 0.5 : 1 }}>
                      <UserX style={{ width: "11px", height: "11px" }} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}