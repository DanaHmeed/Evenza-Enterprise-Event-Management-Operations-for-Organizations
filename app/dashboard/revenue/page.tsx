// app/dashboard/revenue/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, DollarSign } from "lucide-react";
import { t, StatusBadge, StatCard, SectionTitle, FilterButton, OrganizerLoading, OrganizerEmpty, OrganizerPagination } from "@/components/dashboard/OrganizerUI";

interface Order {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string };
  event: { id: string; title: string };
}

type Filter = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export default function OrganizerRevenuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch organizer's events
      const evRes = await fetch("/api/organizer/events?pageSize=100");
      if (!evRes.ok) return;
      const evData = await evRes.json();
      const events = evData.data || [];

      // Fetch orders for each event
      const all: Order[] = [];
      await Promise.all(
        events.map(async (ev: { id: string; title: string }) => {
          try {
            const res = await fetch(`/api/orders?eventId=${ev.id}`);
            if (res.ok) {
              const data = await res.json();
              (data.data || []).forEach((o: Order) => {
                all.push({ ...o, event: { id: ev.id, title: ev.title } });
              });
            }
          } catch { /* skip */ }
        })
      );

      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllOrders(all);
    } catch { console.error("Failed"); }
    finally { setLoading(false); }
  };

  // Filter & paginate
  useEffect(() => {
    let filtered = allOrders;
    if (filter !== "ALL") filtered = filtered.filter((o) => o.paymentStatus === filter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((o) =>
        o.user.name.toLowerCase().includes(q) || o.event.title.toLowerCase().includes(q)
      );
    }
    const pageSize = 20;
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setOrders(filtered.slice((page - 1) * pageSize, page * pageSize));
  }, [allOrders, filter, search, page]);

  const totalRevenue = allOrders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.amount, 0);
  const paidCount = allOrders.filter((o) => o.paymentStatus === "PAID").length;
  const pendingCount = allOrders.filter((o) => o.paymentStatus === "PENDING").length;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const methodLabel: Record<string, string> = { STRIPE: "Stripe", CASH: "Cash", BANK_TRANSFER: "Bank", JAWWAL_PAY: "Jawwal" };
  const filters: Filter[] = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Payment history across your events.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub={`${paidCount} paid orders`} />
        <StatCard label="Total Orders" value={allOrders.length} />
        <StatCard label="Pending" value={pendingCount} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search user or event..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px", fontFamily: t.sans, border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }} />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {filters.map((f) => <FilterButton key={f} label={f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} active={filter === f} onClick={() => { setFilter(f); setPage(1); }} />)}
        </div>
      </div>

      {loading ? <OrganizerLoading /> : orders.length === 0 ? (
        <OrganizerEmpty icon={<CreditCard style={{ width: "32px", height: "32px" }} />} message="No orders found." />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", overflow: "hidden" }}>
          <div className="hidden md:grid" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}>
            <span>User</span><span>Event</span><span>Method</span><span>Amount</span><span>Status</span><span>Date</span>
          </div>
          {orders.map((o, i) => (
            <div key={o.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", transition: "background 0.1s" }} className="grid-cols-1 md:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.user.name}</p>
                <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{o.user.email}</p>
              </div>
              <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.event.title}</p>
              <span style={{ fontSize: "12px", color: t.textMuted }}>{methodLabel[o.paymentMethod] || o.paymentMethod}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>${o.amount}</span>
              <StatusBadge status={o.paymentStatus} />
              <span style={{ fontSize: "12px", color: t.textFaint }}>{fmtDate(o.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
      <OrganizerPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}