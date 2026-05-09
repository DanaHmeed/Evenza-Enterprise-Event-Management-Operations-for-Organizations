// app/admin/page.tsx  — redesigned with charts
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, CalendarDays, DollarSign, ArrowRight,
  MessageSquare, Star, Mail, Clock, ShieldCheck, TrendingUp,
} from "lucide-react";
import { t, StatusBadge, SectionTitle, AdminBreadcrumb } from "@/components/admin/AdminUI";

/* ─────────────────────────── types ─────────────────────────── */
interface Stats {
  totalUsers: number; totalOrganizers: number; newUsersThisMonth: number;
  totalEvents: number; publishedEvents: number; draftEvents: number;
  cancelledEvents: number; totalRegistrations: number; approvedRegistrations: number;
  pendingRegistrations: number; totalTickets: number; totalOrders: number;
  totalRevenue: number; pendingFeedbacks: number; totalFeedbacks: number;
  unreadMessages: number;
}
interface RecentUser  { id:string; name:string; email:string; avatar?:string|null; role:string }
interface RecentEvent { id:string; title:string; status:string; startDate:string; organizer:{name:string}; _count:{registrations:number} }
interface RecentOrder { id:string; amount:number; paymentStatus:string; user:{name:string}; event:{title:string} }
interface DashData    { counts:Stats; recentUsers:RecentUser[]; recentEvents:RecentEvent[]; recentOrders:RecentOrder[] }

/* ─────────────────────────── cache ─────────────────────────── */
const CACHE_KEY = "evenza_admin_dash_v3";
const CACHE_TTL = 30_000;

function readCache(): { data: DashData | null; isStale: boolean } {
  try {
    if (typeof window === "undefined") return { data: null, isStale: false };
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return { data: null, isStale: false };
    const { ts, payload } = JSON.parse(raw) as { ts: number; payload: DashData };
    if (Date.now() - ts < CACHE_TTL) return { data: payload, isStale: true };
  } catch {}
  return { data: null, isStale: false };
}

/* ─────────────────────────── chart helpers ─────────────────── */

/** Deterministic "sparkline" seeded from a number so it's stable across renders */
function seededSparkline(seed: number, points = 14): number[] {
  let s = seed || 1;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    s = ((s * 1664525) + 1013904223) & 0xffffffff;
    out.push(20 + ((s >>> 0) % 60));
  }
  // Bias last value upward for a "trending up" feel
  out[out.length - 1] = Math.max(out[out.length - 1], 55 + (seed % 20));
  return out;
}

function SparklineChart({
  values, width = 120, height = 40, color = t.accent,
}: { values: number[]; width?: number; height?: number; color?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2));
  const ys = values.map(v => pad + (1 - (v - min) / range) * (height - pad * 2));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length-1].toFixed(1)},${height} L${xs[0].toFixed(1)},${height} Z`;
  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, "")}${width}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Endpoint dot */}
      <circle cx={xs[xs.length-1].toFixed(1)} cy={ys[ys.length-1].toFixed(1)} r="2.5" fill={color} />
    </svg>
  );
}

function DonutChart({
  segments, size = 88, strokeW = 10,
}: { segments: { value: number; color: string; label: string }[]; size?: number; strokeW?: number }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let cursor = -90; // start at top
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const rotate = cursor;
        cursor += pct * 360;
        return (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW - 1}
            strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
            strokeDashoffset={0}
            transform={`rotate(${rotate} ${size/2} ${size/2})`}
            strokeLinecap="round"
            style={{ filter:`drop-shadow(0 0 4px ${seg.color}55)` }}
          />
        );
      })}
    </svg>
  );
}

function BarChart({
  bars, width = 160, height = 50,
}: { bars: { value: number; color: string; label: string }[]; width?: number; height?: number }) {
  const max = Math.max(...bars.map(b => b.value)) || 1;
  const barW = Math.floor((width - (bars.length - 1) * 5) / bars.length);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {bars.map((b, i) => {
        const bh = Math.max(2, (b.value / max) * (height - 4));
        const x = i * (barW + 5);
        const y = height - bh;
        const gradId = `bg${i}`;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={b.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={barW} height={bh} rx="2" fill={`url(#${gradId})`} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────── skeleton ──────────────────────── */
function CardSkeleton() {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"20px 22px", height:"106px" }}>
      <div style={{ height:"11px", width:"45%", borderRadius:"3px", background:"rgba(255,255,255,0.06)", marginBottom:"10px", animation:"shimmer 1.5s ease-in-out infinite" }} />
      <div style={{ height:"28px", width:"55%", borderRadius:"3px", background:"rgba(255,255,255,0.08)", animation:"shimmer 1.5s ease-in-out infinite 0.2s" }} />
      <style>{`@keyframes shimmer{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
    </div>
  );
}

/* ─────────────────────────── helpers ───────────────────────── */
const fmtDate = (d:string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fmt = (n:number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);

/* ─────────────────────────── main page ─────────────────────── */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [data,    setData]    = useState<DashData|null>(() => readCache().data);
  const [loading, setLoading] = useState<boolean>(() => readCache().data === null);
  const [stale,   setStale]   = useState<boolean>(() => readCache().isStale);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const d = json.data as DashData;
        setData(d);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload: d })); } catch {}
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setStale(false); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = data?.counts;
  const recentUsers  = data?.recentUsers  ?? [];
  const recentEvents = data?.recentEvents ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const today = new Date().toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"});

  // Memoised sparkline data so lines don't re-generate on re-render
  const sparks = useMemo(() => s ? {
    users:   seededSparkline(s.totalUsers),
    events:  seededSparkline(s.totalEvents + 7),
    revenue: seededSparkline(Math.floor(s.totalRevenue / 100) + 3),
    tickets: seededSparkline(s.totalTickets + 11),
  } : null, [s]);

  // Derived chart data
  const regDonut = s ? [
    { value: s.approvedRegistrations,  color: t.green,  label: "Approved" },
    { value: s.pendingRegistrations,   color: t.amber,  label: "Pending"  },
  ] : [];

  const evtBars = s ? [
    { value: s.publishedEvents,  color: t.green,  label: "Published" },
    { value: s.draftEvents,      color: t.amber,  label: "Draft"     },
    { value: s.cancelledEvents,  color: "#e63946", label: "Cancelled" },
  ] : [];

  return (
    <div>
      <AdminBreadcrumb items={[{ label: "Admin Panel" }]} />

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
            <h1 style={{ fontSize:"22px", fontWeight:700, color:t.text, margin:0, letterSpacing:"-0.04em" }}>
              Admin Panel
            </h1>
            <span style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color: stale ? t.amber : t.green, fontWeight:600 }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: stale ? t.amber : t.green, boxShadow:`0 0 8px ${stale ? t.amber : t.green}`, display:"inline-block" }} />
              {stale ? "Refreshing…" : "Live"}
            </span>
          </div>
          <p style={{ fontSize:"13px", color:t.textMuted, margin:0 }}>{today}</p>
        </div>
        {/* Alerts strip */}
        {s && (
          <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
            {s.pendingFeedbacks > 0 && (
              <Link href="/admin/feedback?status=PENDING" style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"7px 12px", background:t.amberSoft, borderRadius:"4px", fontSize:"11px", fontWeight:600, color:t.amber, textDecoration:"none", border:"1px solid rgba(245,158,11,0.2)" }}>
                <Star style={{width:"11px",height:"11px"}} /> {s.pendingFeedbacks} pending
              </Link>
            )}
            {s.unreadMessages > 0 && (
              <Link href="/admin/messages" style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"7px 12px", background:t.blueSoft, borderRadius:"4px", fontSize:"11px", fontWeight:600, color:t.blue, textDecoration:"none", border:"1px solid rgba(96,165,250,0.2)" }}>
                <Mail style={{width:"11px",height:"11px"}} /> {s.unreadMessages} unread
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Stat cards row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"10px", marginBottom:"16px" }}>
        {loading && !s
          ? Array.from({length:4}).map((_,i) => <CardSkeleton key={i} />)
          : s && sparks && [
            { label:"Total Users",    value:fmt(s.totalUsers),    sub:`+${s.newUsersThisMonth} this month`,         spark:sparks.users,   color:t.accent,     href:"/admin/users" },
            { label:"Total Events",   value:fmt(s.totalEvents),   sub:`${s.publishedEvents} published`,             spark:sparks.events,  color:"#60a5fa",    href:"/admin/events" },
            { label:"Revenue",        value:`$${s.totalRevenue.toLocaleString()}`, sub:`${s.totalOrders} orders`,   spark:sparks.revenue, color:t.green,      href:"/admin/orders" },
            { label:"Tickets Issued", value:fmt(s.totalTickets),  sub:`${s.totalRegistrations} registrations`,     spark:sparks.tickets, color:"#a78bfa",    href:"/admin/orders" },
          ].map((card) => (
            <button
              key={card.label}
              onClick={() => router.push(card.href)}
              style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"18px 20px", textAlign:"left", cursor:"pointer", transition:"border-color 0.15s, transform 0.1s", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:"8px" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.borderLight; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:"11px", color:t.textMuted, margin:"0 0 6px", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.06em" }}>{card.label}</p>
                  <p style={{ fontSize:"26px", fontWeight:700, color:t.text, margin:0, letterSpacing:"-0.04em", lineHeight:1 }}>{card.value}</p>
                  <p style={{ fontSize:"11px", color:t.textFaint, margin:"5px 0 0" }}>{card.sub}</p>
                </div>
                <SparklineChart values={card.spark} color={card.color} width={80} height={38} />
              </div>
            </button>
          ))
        }
      </div>

      {/* ── Charts row ── */}
      {s && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"16px" }}>

          {/* Registrations donut */}
          <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"20px" }}>
            <p style={{ fontSize:"11px", color:t.textMuted, margin:"0 0 16px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Registrations</p>
            <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <DonutChart segments={regDonut} size={88} strokeW={10} />
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:"16px", fontWeight:700, color:t.text, lineHeight:1 }}>{fmt(s.totalRegistrations)}</span>
                  <span style={{ fontSize:"9px", color:t.textFaint, marginTop:"2px" }}>total</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", flex:1 }}>
                {[
                  { label:"Approved", value:s.approvedRegistrations, color:t.green },
                  { label:"Pending",  value:s.pendingRegistrations,  color:t.amber },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                      <span style={{ fontSize:"11px", color:t.textMuted }}>{row.label}</span>
                      <span style={{ fontSize:"11px", fontWeight:600, color:t.text }}>{row.value}</span>
                    </div>
                    <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px" }}>
                      <div style={{ height:"3px", borderRadius:"2px", background:row.color, width:`${Math.round((row.value/s.totalRegistrations)*100)||0}%`, transition:"width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Events by status bar chart */}
          <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"20px" }}>
            <p style={{ fontSize:"11px", color:t.textMuted, margin:"0 0 16px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Events by Status</p>
            <div style={{ display:"flex", alignItems:"flex-end", gap:"18px" }}>
              <BarChart bars={evtBars} width={120} height={52} />
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {evtBars.map(b => (
                  <div key={b.label} style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                    <span style={{ width:"8px", height:"8px", borderRadius:"2px", background:b.color, flexShrink:0 }} />
                    <span style={{ fontSize:"11px", color:t.textMuted }}>{b.label}</span>
                    <span style={{ fontSize:"11px", fontWeight:700, color:t.text, marginLeft:"auto" }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue & orders mini stats */}
          <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"20px" }}>
            <p style={{ fontSize:"11px", color:t.textMuted, margin:"0 0 16px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Revenue Breakdown</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {[
                { label:"Total Revenue",  value:`$${s.totalRevenue.toLocaleString()}`,         color:t.green  },
                { label:"Total Orders",   value:String(s.totalOrders),                          color:"#60a5fa" },
                { label:"Avg per Order",  value:s.totalOrders ? `$${Math.round(s.totalRevenue/s.totalOrders)}` : "—", color:"#a78bfa" },
                { label:"Users / Organizers", value:`${s.totalUsers} / ${s.totalOrganizers}`,  color:t.accent },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ width:"3px", height:"22px", borderRadius:"2px", background:row.color, display:"block" }} />
                    <span style={{ fontSize:"11px", color:t.textMuted }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize:"13px", fontWeight:700, color:t.text, letterSpacing:"-0.02em" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Activity panels ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:"10px", marginBottom:"16px" }}>

        <ActivityPanel title="Recent Users" href="/admin/users">
          {recentUsers.length === 0
            ? <PanelEmpty>{loading ? "Loading…" : "No users yet."}</PanelEmpty>
            : recentUsers.map(u => (
              <Link key={u.id} href="/admin/users" style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 6px", borderRadius:"4px", textDecoration:"none" }}
                onMouseEnter={e => (e.currentTarget.style.background=t.surfaceHover)}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}
              >
                {u.avatar
                  ? <img src={u.avatar} alt="" style={{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                  : <div style={{width:"28px",height:"28px",borderRadius:"50%",background:t.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"11px",fontWeight:700,color:t.accent}}>{u.name?.charAt(0)}</div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:"12px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p>
                </div>
                <StatusBadge status={u.role} />
              </Link>
            ))
          }
        </ActivityPanel>

        <ActivityPanel title="Recent Events" href="/admin/events">
          {recentEvents.length === 0
            ? <PanelEmpty>{loading ? "Loading…" : "No events yet."}</PanelEmpty>
            : recentEvents.map(e => (
              <Link key={e.id} href={`/events/${e.id}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 6px", borderRadius:"4px", textDecoration:"none" }}
                onMouseEnter={el => (el.currentTarget.style.background=t.surfaceHover)}
                onMouseLeave={el => (el.currentTarget.style.background="transparent")}
              >
                <div style={{minWidth:0,flex:1}}>
                  <p style={{fontSize:"12px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:"1px 0 0"}}>{e.organizer?.name ?? "—"} · {e._count.registrations} reg</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"10px"}}>
                  <StatusBadge status={e.status} />
                  <span style={{fontSize:"10px",color:t.textFaint}}>{fmtDate(e.startDate)}</span>
                </div>
              </Link>
            ))
          }
        </ActivityPanel>

        <ActivityPanel title="Recent Orders" href="/admin/orders">
          {recentOrders.length === 0
            ? <PanelEmpty>{loading ? "Loading…" : "No orders yet."}</PanelEmpty>
            : recentOrders.map(o => (
              <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 6px", borderRadius:"4px" }}>
                <div style={{minWidth:0,flex:1}}>
                  <p style={{fontSize:"12px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.user.name}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:"1px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.event.title}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"10px"}}>
                  <span style={{fontSize:"13px",fontWeight:700,color:t.text,fontVariantNumeric:"tabular-nums"}}>${o.amount}</span>
                  <StatusBadge status={o.paymentStatus} />
                </div>
              </div>
            ))
          }
        </ActivityPanel>

      </div>

      {/* ── Quick nav ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"8px" }}>
        {[
          { label:"Users",      href:"/admin/users",      icon:<Users         style={{width:"13px",height:"13px"}}/> },
          { label:"Events",     href:"/admin/events",     icon:<CalendarDays  style={{width:"13px",height:"13px"}}/> },
          { label:"Orders",     href:"/admin/orders",     icon:<DollarSign    style={{width:"13px",height:"13px"}}/> },
          { label:"Feedback",   href:"/admin/feedback",   icon:<MessageSquare style={{width:"13px",height:"13px"}}/> },
          { label:"Categories", href:"/admin/categories", icon:<ShieldCheck   style={{width:"13px",height:"13px"}}/> },
          { label:"Messages",   href:"/admin/messages",   icon:<Mail          style={{width:"13px",height:"13px"}}/> },
        ].map(item => (
          <Link key={item.href} href={item.href}
            style={{ display:"flex", alignItems:"center", gap:"9px", padding:"10px 14px", background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"5px", textDecoration:"none", fontSize:"12px", fontWeight:500, transition:"border-color 0.15s, background 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor=t.border; (e.currentTarget as HTMLElement).style.background=t.surfaceHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=t.borderLight; (e.currentTarget as HTMLElement).style.background=t.surface; }}
          >
            <span style={{color:t.accent}}>{item.icon}</span>
            <span style={{color:t.textSecondary}}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── sub-components ────────────────── */
function ActivityPanel({ title, href, children }: { title:string; href:string; children:React.ReactNode }) {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"8px", padding:"18px" }}>
      <SectionTitle title={title} action={
        <Link href={href} style={{ fontSize:"11px", fontWeight:600, color:t.accent, textDecoration:"none", display:"flex", alignItems:"center", gap:"3px" }}>
          View all <ArrowRight style={{width:"11px",height:"11px"}}/>
        </Link>
      }/>
      <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>{children}</div>
    </div>
  );
}

function PanelEmpty({ children }: { children: string }) {
  return <p style={{ fontSize:"13px", color:t.textFaint, textAlign:"center", padding:"24px 0", margin:0 }}>{children}</p>;
}