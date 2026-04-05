// app/dashboard/revenue/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, CheckCircle2, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { t, StatusBadge, StatCard, FilterButton, OrganizerLoading, OrganizerEmpty, OrganizerPagination } from "@/components/dashboard/OrganizerUI";

interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string | null;
  user: { name: string; email: string };
  event: { id: string; title: string };
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

type Filter = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

const ACTION_MAP: Record<string, string> = { PAID: "mark_paid", FAILED: "mark_failed", REFUNDED: "refund" };

export default function OrganizerRevenuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalOrders: 0, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchOrders = async (currentFilter: Filter, currentSearch: string, currentPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), pageSize: "20" });
      if (currentFilter !== "ALL") params.set("status", currentFilter);
      if (currentSearch) params.set("search", currentSearch);

      const res = await fetch(`/api/organizer/orders?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      setOrders(data.data || []);
      setStats(data.stats || { totalRevenue: 0, totalOrders: 0, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { console.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(filter, search, page); }, [filter, search, page]);

  const markAs = async (orderId: string, paymentStatus: "PAID" | "REFUNDED" | "FAILED") => {
    const label = paymentStatus === "PAID" ? "mark as paid" : paymentStatus === "REFUNDED" ? "refund" : "mark as failed";
    if (!confirm(`Are you sure you want to ${label} this order?`)) return;

    setProcessing(orderId);
    try {
      const res = await fetch(`/api/organizer/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: ACTION_MAP[paymentStatus] }),
      });
      if (res.ok) {
        // Refresh current page to get accurate data
        fetchOrders(filter, search, page);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update order");
      }
    } catch { alert("Failed to update"); }
    finally { setProcessing(null); }
  };

  const totalRevenue = stats.totalRevenue;
  const paidCount = stats.paidCount;
  const pendingCount = stats.pendingCount;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const methodLabel: Record<string, string> = { STRIPE: "Stripe", CASH: "Cash", BANK_TRANSFER: "Bank", JAWWAL_PAY: "Jawwal" };
  const isManual = (method: string) => ["CASH", "BANK_TRANSFER", "JAWWAL_PAY"].includes(method);
  const filters: Filter[] = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Payment history across your events.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub={`${paidCount} paid orders`} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending" value={pendingCount} sub={pendingCount > 0 ? "awaiting confirmation" : undefined} />
      </div>

      {pendingCount > 0 && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", background: t.amberSoft, borderRadius: "6px", fontSize: "13px", fontWeight: 500, color: t.amber, display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle style={{ width: "14px", height: "14px" }} />
          {pendingCount} order{pendingCount > 1 ? "s" : ""} pending — manual payments need your confirmation.
        </div>
      )}

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
          <div className="hidden md:grid" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px", gap: "8px", padding: "10px 20px", background: t.borderLight, fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: t.textFaint }}>
            <span>User</span><span>Event</span><span>Method</span><span>Amount</span><span>Status</span><span>Date</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {orders.map((o, i) => {
            const pending = o.paymentStatus === "PENDING" && isManual(o.paymentMethod);
            return (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px", gap: "8px", padding: "12px 20px", alignItems: "center", borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none", borderLeft: pending ? `3px solid ${t.amber}` : "none", transition: "background 0.1s" }} className="grid-cols-1 md:grid-cols-none"
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                  {pending && (
                    <button onClick={() => markAs(o.id, "PAID")} disabled={processing === o.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.green, background: t.greenSoft, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === o.id ? 0.5 : 1 }}>
                      {processing === o.id ? <Loader2 className="animate-spin" style={{ width: "11px", height: "11px" }} /> : <CheckCircle2 style={{ width: "11px", height: "11px" }} />}
                      Mark Paid
                    </button>
                  )}
                  {o.paymentStatus === "PAID" && (
                    <button onClick={() => markAs(o.id, "REFUNDED")} disabled={processing === o.id}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "11px", fontWeight: 600, fontFamily: t.sans, color: t.textMuted, background: t.borderLight, border: "none", borderRadius: "3px", cursor: "pointer", opacity: processing === o.id ? 0.5 : 1 }}>
                      <RefreshCw style={{ width: "11px", height: "11px" }} />
                      Refund
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <OrganizerPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}