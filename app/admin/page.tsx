// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, CalendarDays, DollarSign, ArrowRight,
  MessageSquare, Star, Mail, Clock, ShieldCheck,
} from "lucide-react";
import { t, StatusBadge, SectionTitle, StatCard } from "@/components/admin/AdminUI";

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

const CACHE_KEY = "evenza_admin_dash_v2";
const CACHE_TTL = 30_000;

/** Read the session-storage cache once at module-level; safe for lazy useState init */
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

const fmtDate = (d:string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});

function StatSkeleton() {
  return (
    <div style={{ background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"6px", padding:"20px 22px" }}>
      <div style={{ height:"26px", width:"55%", borderRadius:"3px", background:"rgba(255,255,255,0.07)", marginBottom:"8px", animation:"shimmer 1.6s ease-in-out infinite" }} />
      <div style={{ height:"11px", width:"40%", borderRadius:"3px", background:"rgba(255,255,255,0.04)", animation:"shimmer 1.6s ease-in-out infinite" }} />
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Lazy initialisers — run once before the first render, no setState in effects
  const [data,    setData]    = useState<DashData|null>(() => readCache().data);
  const [loading, setLoading] = useState<boolean>(() => readCache().data === null);
  const [stale,   setStale]   = useState<boolean>(() => readCache().isStale);

  useEffect(() => {
    // Always fetch fresh data; if cache was warm this runs silently in background
    fetch("/api/admin/stats")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((json) => {
        const d = json.data as DashData;
        setData(d);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload: d }));
        } catch {}
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setStale(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats        = data?.counts;
  const recentUsers  = data?.recentUsers  ?? [];
  const recentEvents = data?.recentEvents ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const today = new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});

  return (
    <div>
      <div style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:600, color:t.text, margin:0, letterSpacing:"-0.03em" }}>Admin Panel</h1>
          <span style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:t.green, fontWeight:600 }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:t.green, boxShadow:`0 0 8px ${t.green}`, display:"inline-block" }} />
            {stale ? "Refreshing…" : "Live"}
          </span>
        </div>
        <p style={{ fontSize:"13px", color:t.textMuted, margin:0 }}>Platform overview · {today}</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))", gap:"10px", marginBottom:"22px" }}>
        {loading && !stats
          ? Array.from({length:6}).map((_,i) => <StatSkeleton key={i} />)
          : stats && <>
              <StatCard label="Total Users"    value={stats.totalUsers}   sub={`+${stats.newUsersThisMonth} this month`}         onClick={() => router.push("/admin/users")} accent />
              <StatCard label="Organizers"     value={stats.totalOrganizers}                                                     onClick={() => router.push("/admin/users?role=ORGANIZER")} />
              <StatCard label="Total Events"   value={stats.totalEvents}  sub={`${stats.publishedEvents} published`}             onClick={() => router.push("/admin/events")} />
              <StatCard label="Revenue"        value={`$${stats.totalRevenue.toLocaleString()}`} sub={`${stats.totalOrders} orders`} onClick={() => router.push("/admin/orders")} />
              <StatCard label="Registrations"  value={stats.totalRegistrations} sub={`${stats.pendingRegistrations} pending`} />
              <StatCard label="Tickets Issued" value={stats.totalTickets} />
            </>
        }
      </div>

      {stats && (stats.pendingFeedbacks > 0 || stats.unreadMessages > 0 || stats.draftEvents > 0) && (
        <div style={{ display:"flex", gap:"8px", marginBottom:"22px", flexWrap:"wrap" }}>
          {stats.pendingFeedbacks > 0 && (
            <Link href="/admin/feedback?status=PENDING" style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"8px 14px", background:t.amberSoft, borderRadius:"4px", fontSize:"12px", fontWeight:600, color:t.amber, textDecoration:"none", border:"1px solid rgba(245,158,11,0.2)" }}>
              <Star style={{width:"12px",height:"12px"}} /> {stats.pendingFeedbacks} feedback{stats.pendingFeedbacks>1?"s":""} pending
            </Link>
          )}
          {stats.unreadMessages > 0 && (
            <Link href="/admin/messages" style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"8px 14px", background:t.blueSoft, borderRadius:"4px", fontSize:"12px", fontWeight:600, color:t.blue, textDecoration:"none", border:"1px solid rgba(96,165,250,0.2)" }}>
              <Mail style={{width:"12px",height:"12px"}} /> {stats.unreadMessages} unread message{stats.unreadMessages>1?"s":""}
            </Link>
          )}
          {stats.draftEvents > 0 && (
            <Link href="/admin/events" style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"8px 14px", background:t.surface, borderRadius:"4px", fontSize:"12px", fontWeight:600, color:t.textMuted, textDecoration:"none", border:`1px solid ${t.borderLight}` }}>
              <Clock style={{width:"12px",height:"12px"}} /> {stats.draftEvents} draft{stats.draftEvents>1?"s":""}
            </Link>
          )}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"12px", marginBottom:"22px" }}>
        <ActivityPanel title="Recent Users" href="/admin/users">
          {recentUsers.length === 0
            ? <PanelEmpty>{loading?"Loading…":"No users yet."}</PanelEmpty>
            : recentUsers.map((u) => (
              <Link key={u.id} href="/admin/users" style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 8px", borderRadius:"4px", textDecoration:"none", transition:"background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background=t.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
              >
                {u.avatar
                  ? <img src={u.avatar} alt="" style={{width:"30px",height:"30px",borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
                  : <div style={{width:"30px",height:"30px",borderRadius:"50%",background:t.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"11px",fontWeight:700,color:t.accent}}>{u.name?.charAt(0)}</div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:"13px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</p>
                </div>
                <StatusBadge status={u.role} />
              </Link>
            ))
          }
        </ActivityPanel>

        <ActivityPanel title="Recent Events" href="/admin/events">
          {recentEvents.length === 0
            ? <PanelEmpty>{loading?"Loading…":"No events yet."}</PanelEmpty>
            : recentEvents.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 8px", borderRadius:"4px", textDecoration:"none", transition:"background 0.1s" }}
                onMouseEnter={(el) => (el.currentTarget.style.background=t.surfaceHover)}
                onMouseLeave={(el) => (el.currentTarget.style.background="transparent")}
              >
                <div style={{minWidth:0,flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:"2px 0 0"}}>{e.organizer?.name ?? "—"} · {e._count.registrations} reg</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"12px"}}>
                  <StatusBadge status={e.status} />
                  <span style={{fontSize:"11px",color:t.textMuted}}>{fmtDate(e.startDate)}</span>
                </div>
              </Link>
            ))
          }
        </ActivityPanel>

        <ActivityPanel title="Recent Orders" href="/admin/orders">
          {recentOrders.length === 0
            ? <PanelEmpty>{loading?"Loading…":"No orders yet."}</PanelEmpty>
            : recentOrders.map((o) => (
              <div key={o.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 8px", borderRadius:"4px" }}>
                <div style={{minWidth:0,flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:600,color:t.text,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.user.name}</p>
                  <p style={{fontSize:"11px",color:t.textMuted,margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.event.title}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,marginLeft:"12px"}}>
                  <span style={{fontSize:"13px",fontWeight:700,color:t.text,fontVariantNumeric:"tabular-nums"}}>${o.amount}</span>
                  <StatusBadge status={o.paymentStatus} />
                </div>
              </div>
            ))
          }
        </ActivityPanel>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(175px, 1fr))", gap:"8px" }}>
        {[
          {label:"Users",      href:"/admin/users",      icon:<Users         style={{width:"14px",height:"14px"}}/>},
          {label:"Events",     href:"/admin/events",     icon:<CalendarDays  style={{width:"14px",height:"14px"}}/>},
          {label:"Orders",     href:"/admin/orders",     icon:<DollarSign    style={{width:"14px",height:"14px"}}/>},
          {label:"Feedback",   href:"/admin/feedback",   icon:<MessageSquare style={{width:"14px",height:"14px"}}/>},
          {label:"Categories", href:"/admin/categories", icon:<ShieldCheck   style={{width:"14px",height:"14px"}}/>},
          {label:"Messages",   href:"/admin/messages",   icon:<Mail          style={{width:"14px",height:"14px"}}/>},
        ].map((item) => (
          <Link key={item.href} href={item.href}
            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", background:t.surface, border:`1px solid ${t.borderLight}`, borderRadius:"5px", textDecoration:"none", fontSize:"12px", fontWeight:500,transition:"border-color 0.15s, background 0.15s" }}
            onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.borderColor=t.border;(e.currentTarget as HTMLElement).style.background=t.surfaceHover;}}
            onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.borderColor=t.borderLight;(e.currentTarget as HTMLElement).style.background=t.surface;}}
          >
            <span style={{color:t.accent}}>{item.icon}</span>
            <span style={{color:t.textSecondary}}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActivityPanel({title,href,children}:{title:string;href:string;children:React.ReactNode}) {
  return (
    <div style={{background:t.surface,border:`1px solid ${t.borderLight}`,borderRadius:"6px",padding:"20px"}}>
      <SectionTitle title={title} action={
        <Link href={href} style={{fontSize:"11px",fontWeight:600,color:t.accent,textDecoration:"none",display:"flex",alignItems:"center",gap:"3px"}}>
          View all <ArrowRight style={{width:"11px",height:"11px"}}/>
        </Link>
      }/>
      <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>{children}</div>
    </div>
  );
}
function PanelEmpty({children}:{children:string}) {
  return <p style={{fontSize:"13px",color:t.textFaint,textAlign:"center",padding:"24px 0",margin:0}}>{children}</p>;
}