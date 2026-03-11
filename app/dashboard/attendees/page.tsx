// app/dashboard/attendees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Users, Search, CheckCircle2, UserCheck, UserX, Loader2 } from "lucide-react";
import { t, StatusBadge, FilterButton, OrganizerLoading, OrganizerEmpty, OrganizerPagination } from "@/components/dashboard/OrganizerUI";

interface Attendee {
  id: string;
  status: string;
  checkedIn: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
  event: { id: string; title: string };
  ticket?: { ticketNumber: string } | null;
}

type Filter = "ALL" | "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";

export default function OrganizerAttendeesPage() {
  const { user } = useUser();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => { fetchAttendees(); }, [page, filter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchAttendees(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      // Fetch all organizer's events first, then attendees
      const eventsRes = await fetch("/api/organizer/events?pageSize=100");
      if (!eventsRes.ok) return;
      const eventsData = await eventsRes.json();
      const events = eventsData.data || [];

      // Fetch attendees for all events in parallel
      const allAttendees: Attendee[] = [];
      await Promise.all(
        events.map(async (event: { id: string; title: string }) => {
          try {
            const res = await fetch(`/api/events/${event.id}/attendees`);
            if (res.ok) {
              const data = await res.json();
              const atts = (data.data?.attendees || []).map((a: Attendee) => ({
                ...a,
                event: { id: event.id, title: event.title },
              }));
              allAttendees.push(...atts);
            }
          } catch { /* skip */ }
        })
      );

      // Sort by date, newest first
      allAttendees.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Client-side filter & search
      let filtered = allAttendees;
      if (filter !== "ALL") filtered = filtered.filter((a) => a.status === filter);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((a) =>
          a.user.name.toLowerCase().includes(q) ||
          a.user.email.toLowerCase().includes(q) ||
          a.event.title.toLowerCase().includes(q)
        );
      }

      setTotal(filtered.length);
      const pageSize = 20;
      setTotalPages(Math.ceil(filtered.length / pageSize));
      setAttendees(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };

  const handleApproval = async (att: Attendee, action: "APPROVED" | "REJECTED") => {
    setProcessing(att.id);
    try {
      const res = await fetch(`/api/events/${att.event.id}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: att.id, status: action }),
      });
      if (res.ok) {
        setAttendees((prev) => prev.map((a) => a.id === att.id ? { ...a, status: action } : a));
      }
    } catch { alert("Failed"); }
    finally { setProcessing(null); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const filters: Filter[] = ["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>All Attendees</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>{total} registrations across all your events.</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or event..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px", fontFamily: t.sans, border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }} />
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {filters.map((f) => <FilterButton key={f} label={f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} active={filter === f} onClick={() => { setFilter(f); setPage(1); }} />)}
        </div>
      </div>

      {loading ? <OrganizerLoading /> : attendees.length === 0 ? (
        <OrganizerEmpty icon={<Users style={{ width: "32px", height: "32px" }} />} message="No attendees found." />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", overflow: "hidden" }}>
          <div className="hidden md:grid" style={{ gridTemplateColumns: "2.5fr 2fr 1fr 1fr 120px", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}>
            <span>Attendee</span><span>Event</span><span>Status</span><span>Check-in</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {attendees.map((att, i) => (
            <div key={att.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1fr 1fr 120px", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition: "background 0.1s" }} className="grid-cols-1 md:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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
                  <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{att.user.email}</p>
                </div>
              </div>
              <Link href={`/dashboard/events/${att.event.id}/attendees`} style={{ fontSize: "13px", color: t.textSecondary, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = t.textSecondary)}>
                {att.event.title}
              </Link>
              <StatusBadge status={att.status} />
              {att.checkedIn ? (
                <span style={{ fontSize: "11px", fontWeight: 600, color: t.green, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 style={{ width: "12px", height: "12px" }} /> Yes
                </span>
              ) : (
                <span style={{ fontSize: "11px", color: t.textFaint }}>No</span>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                {att.status === "PENDING" && (
                  <>
                    <button onClick={() => handleApproval(att, "APPROVED")} disabled={processing === att.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.green, background: t.greenSoft, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === att.id ? 0.5 : 1 }}>
                      <UserCheck style={{ width: "11px", height: "11px" }} /> Approve
                    </button>
                    <button onClick={() => handleApproval(att, "REJECTED")} disabled={processing === att.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.red, background: t.redSoft, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === att.id ? 0.5 : 1 }}>
                      <UserX style={{ width: "11px", height: "11px" }} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <OrganizerPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}