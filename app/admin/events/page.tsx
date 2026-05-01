// app/admin/events/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, Search, MoreHorizontal,
  CheckCircle2, Clock, Ban, Trash2, ExternalLink,
} from "lucide-react";
import { t, StatusBadge, AdminPagination, AdminEmpty, AdminBreadcrumb } from "@/components/admin/AdminUI";

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
  organizer?: { id: string; name: string } | null;
  category?: { name: string } | null;
  _count: { registrations: number };
}

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "CANCELLED" | "COMPLETED";
const FILTERS: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"];
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function SkeletonRow() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "3fr 1.4fr 1fr 1fr 1fr 72px",
      gap: "8px", padding: "12px 18px", alignItems: "center",
      borderTop: `1px solid ${t.borderLight}`,
    }}>
      {[["80%","50%"],["60%"],["70%"],["40%"],["50%"],["30%"]].map((ws, col) => (
        <div key={col} style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
          {ws.map((w, i) => (
            <div key={i} style={{
              height: i===0?"12px":"10px", width: w, borderRadius:"3px",
              background:"rgba(255,255,255,0.06)", animation:"shimmer 1.6s ease-in-out infinite",
            }} />
          ))}
        </div>
      ))}
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events,       setEvents]       = useState<EventData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [menuId,       setMenuId]       = useState<string | null>(null);
  const [processing,   setProcessing]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const params = new URLSearchParams({
      page: page.toString(), pageSize: "15",
      sortBy: "createdAt", sortOrder: "desc", all: "true",
    });
    if (debouncedSearch)        params.set("search", debouncedSearch);
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    setLoading(true);
    fetch(`/api/events?${params}`, { signal: ctrl.signal })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setEvents(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      })
      .catch((err) => { if (err?.name !== "AbortError") console.error(err); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [page, debouncedSearch, statusFilter]);

  const patchEvent = async (id: string, body: Record<string, unknown>) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) setEvents((p) => p.map((e) => e.id === id ? { ...e, ...body } as EventData : e));
    } catch { alert("Failed to update event."); }
    finally { setProcessing(null); setMenuId(null); }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) { setEvents((p) => p.filter((e) => e.id !== id)); setTotal((n) => n - 1); }
    } catch { alert("Failed to delete event."); }
    finally { setProcessing(null); setMenuId(null); }
  };

  return (
    <div>
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Events" }]} />
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: t.text, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Events
        </h1>
        <p style={{ fontSize: "13px", color: t.textMuted, margin: 0 }}>
          {loading ? "Loading…" : `${total.toLocaleString()} total events`}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "320px" }}>
          <Search style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", width:"13px", height:"13px", color:t.textMuted, pointerEvents:"none" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            style={{ width:"100%", padding:"8px 14px 8px 32px", fontSize:"13px", borderRadius:"4px", outline:"none", color:t.text, background:"rgba(255,255,255,0.05)", border:`1px solid ${t.border}`, boxSizing:"border-box", transition:"border-color 0.15s" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = t.accent)}
            onBlur={(e)  => (e.currentTarget.style.borderColor = t.border)}
          />
        </div>
        <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
          {FILTERS.map((s) => {
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding:"7px 13px", fontSize:"12px", fontWeight:500, borderRadius:"4px", cursor:"pointer", border:`1px solid ${active ? t.accent : t.borderLight}`, background: active ? t.accentSoft : "transparent", color: active ? t.accent : t.textMuted, transition:"all 0.12s" }}
                onMouseEnter={(e) => { if(!active) e.currentTarget.style.borderColor = t.border; }}
                onMouseLeave={(e) => { if(!active) e.currentTarget.style.borderColor = t.borderLight; }}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {!loading && events.length === 0 ? (
        <AdminEmpty icon={<CalendarDays style={{ width:"30px", height:"30px" }} />} message="No events found." />
      ) : (
        <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"6px", overflow:"hidden", opacity: loading ? 0.65 : 1, transition:"opacity 0.15s" }}>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 1.4fr 1fr 1fr 1fr 72px", gap:"8px", padding:"10px 18px", background:"rgba(255,255,255,0.022)", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:t.textSecondary }}>
            <span>Event</span><span>Organizer</span><span>Date</span><span>Status</span><span>Capacity</span>
            <span style={{ textAlign:"right" }}>Actions</span>
          </div>

          {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && events.map((event, i) => {
            const registered = (event.capacity ?? 0) - (event.seatsRemaining ?? 0);
            return (
              <div key={event.id} style={{ display:"grid", gridTemplateColumns:"3fr 1.4fr 1fr 1fr 1fr 72px", gap:"8px", padding:"11px 18px", alignItems:"center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition:"background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
                  <div style={{ width:"34px", height:"34px", borderRadius:"4px", overflow:"hidden", flexShrink:0, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {event.banner
                      ? <img src={event.banner} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" />
                      : <CalendarDays style={{ width:"13px", height:"13px", color:t.text }} />}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:t.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{event.title}</p>
                    <p style={{ fontSize:"11px", color:t.textMuted, margin:0 }}>{event.category?.name || "—"} · {event.eventType === "FREE" ? "Free" : `$${event.price}`}</p>
                  </div>
                </div>

                <span style={{ fontSize:"12px", color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{event.organizer?.name ?? "—"}</span>
                <span style={{ fontSize:"12px", color:t.textMuted }}>{fmtDate(event.startDate)}</span>
                <StatusBadge status={event.status} />
                <span style={{ fontSize:"12px", color:t.textMuted, fontVariantNumeric:"tabular-nums" }}>{registered}/{event.capacity ?? "?"}</span>

                <div style={{ display:"flex", justifyContent:"flex-end", gap:"2px", position:"relative" }}>
                  <Link href={`/events/${event.id}`} style={{ width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", color:t.textMuted, borderRadius:"4px", transition:"background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceActive)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ExternalLink style={{ width:"12px", height:"12px" }} />
                  </Link>
                  <div style={{ position:"relative" }}>
                    <button onClick={() => setMenuId(menuId === event.id ? null : event.id)}
                      style={{ width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", border:"none", background:"transparent", color:t.textMuted, cursor:"pointer", borderRadius:"4px", transition:"background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = t.surfaceActive)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <MoreHorizontal style={{ width:"14px", height:"14px" }} />
                    </button>
                    {menuId === event.id && (
                      <>
                        <div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={() => setMenuId(null)} />
                        <div style={{ position:"absolute", right:0, top:"100%", marginTop:"4px", width:"158px", background:"#17171c", border:`1px solid ${t.border}`, borderRadius:"5px", boxShadow:"0 8px 28px rgba(0,0,0,0.45)", zIndex:20, padding:"4px" }}>
                          {event.status === "DRAFT"     && <DropItem icon={<CheckCircle2 style={{ width:"14px", height:"14px" }}/>} label="Publish"   color={t.green}  onClick={() => patchEvent(event.id,{status:"PUBLISHED"})} disabled={processing===event.id} />}
                          {event.status === "PUBLISHED" && <DropItem icon={<Clock style={{ width:"14px", height:"14px" }}/>}        label="Unpublish" color={t.amber}  onClick={() => patchEvent(event.id,{status:"DRAFT"})}      disabled={processing===event.id} />}
                          {event.status !== "CANCELLED" && <DropItem icon={<Ban style={{ width:"14px", height:"14px" }}/>}          label="Cancel"    color={t.accent} onClick={() => patchEvent(event.id,{status:"CANCELLED"})}  disabled={processing===event.id} />}
                          <div style={{ height:"1px", background:t.borderLight, margin:"3px 0" }} />
                          <DropItem icon={<Trash2 style={{ width:"14px", height:"14px" }}/>} label="Delete" color={t.accent} onClick={() => deleteEvent(event.id)} disabled={processing===event.id} />
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

function DropItem({ icon, label, color, onClick, disabled }: { icon:React.ReactNode; label:string; color:string; onClick:()=>void; disabled:boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"7px 10px", fontSize:"12px", fontWeight:500, color, background:"transparent", border:"none", cursor:disabled?"default":"pointer",  opacity:disabled?0.45:1, borderRadius:"3px", transition:"background 0.1s" }}
      onMouseEnter={(e) => { if(!disabled) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; }}
    >
      <span style={{ width:"14px", height:"14px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</span>
      {label}
    </button>
  );
}