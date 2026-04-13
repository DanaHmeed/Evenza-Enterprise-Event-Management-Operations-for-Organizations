"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import {
  t,
  StatusBadge,
  FilterButton,
  OrganizerLoading,
  OrganizerEmpty,
  OrganizerPagination,
} from "@/components/dashboard/OrganizerUI";
import ActionToast from "@/components/modals/ActionToast";

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

const ACTION_MAP: Record<string, string> = {
  PAID: "mark_paid",
  FAILED: "mark_failed",
  REFUNDED: "refund",
};

const METHOD_LABEL: Record<string, string> = {
  STRIPE: "Stripe",
  CASH: "Cash",
  BANK_TRANSFER: "Bank",
  JAWWAL_PAY: "Jawwal",
};

/* ─── Stat tile ─────────────────────────────────────────────────────────── */
function StatTile({
  label,
  value,
  sub,
  color = t.text,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div style={{
      background: "#fff",
      borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
      borderRadius: 6, padding: "16px 20px",
      flex: "1 1 0", minWidth: 0,
    }}>
      <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0}}>
        {value}
      </p>
      <p style={{
        fontSize: 10, fontWeight: 700, color: t.textFaint, margin: "3px 0 0",
        textTransform: "uppercase", letterSpacing: "0.08em"
      }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: t.textFaint, margin: "4px 0 0" }}>{sub}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function OrganizerRevenuePage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [stats, setStats]       = useState<Stats>({
    totalRevenue: 0, totalOrders: 0,
    paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0,
  });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<Filter>("ALL");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast]       = useState<{ message: string; description?: string; variant: "success" | "error" } | null>(null);

  const fetchOrders = useCallback(async (
    f: Filter, s: string, p: number
  ) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(p), pageSize: "20" });
      if (f !== "ALL") qs.set("status", f);
      if (s) qs.set("search", s);

      const res = await fetch(`/api/organizer/orders?${qs}`);
      if (!res.ok) return;
      const data = await res.json();

      setOrders(data.data || []);
      setStats(data.stats || { totalRevenue: 0, totalOrders: 0, paidCount: 0, pendingCount: 0, failedCount: 0, refundedCount: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setToast({ message: "Failed to load orders", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(filter, search, page); }, [filter, search, page, fetchOrders]);

  const markAs = async (orderId: string, paymentStatus: "PAID" | "REFUNDED" | "FAILED") => {
    const label =
      paymentStatus === "PAID"     ? "mark as paid" :
      paymentStatus === "REFUNDED" ? "refund" : "mark as failed";
    if (!confirm(`Are you sure you want to ${label} this order?`)) return;

    setProcessing(orderId);
    try {
      const res = await fetch(`/api/organizer/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: ACTION_MAP[paymentStatus] }),
      });
      if (res.ok) {
        fetchOrders(filter, search, page);
        setToast({
          message: paymentStatus === "PAID" ? "Payment confirmed" : paymentStatus === "REFUNDED" ? "Order refunded" : "Order marked failed",
          description: paymentStatus === "PAID" ? "Registration and ticket have been issued." : undefined,
          variant: paymentStatus === "FAILED" ? "error" : "success",
        });
      } else {
        const d = await res.json();
        setToast({ message: d.error || "Failed to update order", variant: "error" });
      }
    } catch {
      setToast({ message: "Network error", variant: "error" });
    } finally { setProcessing(null); }
  };

  /* ── export CSV ── */
  const exportCSV = () => {
    const rows = [["Order", "User", "Email", "Event", "Method", "Amount", "Status", "Date"]];
    orders.forEach((o) => rows.push([
      o.orderNumber, o.user.name, o.user.email, o.event.title,
      METHOD_LABEL[o.paymentMethod] || o.paymentMethod,
      `${o.currency} ${o.amount}`, o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "revenue.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const isManual = (m: string) => ["CASH", "BANK_TRANSFER", "JAWWAL_PAY"].includes(m);
  const fmtDate  = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtMoney = (n: number, cur = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: 0 }).format(n);

  const filters: Filter[] = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"];

  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px", borderStyle: "solid", borderColor: t.borderLight,
    borderRadius: 6, overflow: "hidden",
  };

  return (
    <>
      {toast && <ActionToast {...toast} duration={4000} onClose={() => setToast(null)} />}

      <div style={{  minHeight: "100vh", background: "#f7f7f4" }}>

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
            <span style={{ color: t.text, fontWeight: 600 }}>Revenue</span>
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

        {/* ── Body ── */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
              Revenue
            </h1>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              Payment history across all your events.
            </p>
          </div>

          {/* Stat tiles */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <StatTile
              label="Total Revenue"
              value={fmtMoney(stats.totalRevenue)}
              sub={`${stats.paidCount} paid order${stats.paidCount !== 1 ? "s" : ""}`}
              color={t.green}
            />
            <StatTile label="Total Orders" value={stats.totalOrders} />
            <StatTile label="Pending"  value={stats.pendingCount}  color={stats.pendingCount  > 0 ? t.amber : t.text} />
            <StatTile label="Failed"   value={stats.failedCount}   color={stats.failedCount   > 0 ? t.red   : t.text} />
            <StatTile label="Refunded" value={stats.refundedCount} color={t.textFaint} />
          </div>

          {/* Pending banner */}
          {stats.pendingCount > 0 && (
            <div style={{
              marginBottom: 20, padding: "12px 16px",
              background: t.amberSoft, borderRadius: 6,
              fontSize: 13, fontWeight: 500, color: t.amber,
              display: "flex", alignItems: "center", gap: 8,
              borderWidth: "1px", borderStyle: "solid", borderColor: "#fde68a",
            }}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {stats.pendingCount} order{stats.pendingCount > 1 ? "s" : ""} pending — manual payments need your confirmation.
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search user or event…"
                style={{
                  width: "100%", padding: "9px 14px 9px 34px", fontSize: 13,
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
          ) : orders.length === 0 ? (
            <OrganizerEmpty
              icon={<CreditCard style={{ width: 32, height: 32 }} />}
              message="No orders found."
            />
          ) : (
            <div style={card}>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px",
                gap: 8, padding: "10px 20px",
                background: t.borderLight,
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", color: t.textFaint,
              }}>
                <span>User</span>
                <span>Event</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
                <span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {orders.map((o, i) => {
                const isPendingManual = o.paymentStatus === "PENDING" && isManual(o.paymentMethod);
                return (
                  <div
                    key={o.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 140px",
                      gap: 8, padding: "12px 20px", alignItems: "center",
                      borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                      borderLeft: isPendingManual ? `3px solid ${t.amber}` : "3px solid transparent",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* User */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.user.name}
                      </p>
                      <p style={{ fontSize: 11, color: t.textFaint, margin: 0 }}>{o.user.email}</p>
                    </div>

                    {/* Event */}
                    <Link
                      href={`/dashboard/events/${o.event.id}/attendees`}
                      style={{ fontSize: 13, color: t.textSecondary, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = t.accent)}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = t.textSecondary)}
                    >
                      {o.event.title}
                    </Link>

                    {/* Method */}
                    <span style={{ fontSize: 12, color: t.textMuted }}>
                      {METHOD_LABEL[o.paymentMethod] || o.paymentMethod}
                    </span>

                    {/* Amount */}
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                      {fmtMoney(o.amount, o.currency)}
                    </span>

                    {/* Status */}
                    <StatusBadge status={o.paymentStatus} />

                    {/* Date */}
                    <span style={{ fontSize: 12, color: t.textFaint }}>{fmtDate(o.createdAt)}</span>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      {isPendingManual && (
                        <button
                          onClick={() => markAs(o.id, "PAID")}
                          disabled={processing === o.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
                            color: t.green, background: t.greenSoft,
                            border: "none", borderRadius: 3,
                            cursor: processing === o.id ? "default" : "pointer",
                            opacity: processing === o.id ? 0.5 : 1,
                          }}
                        >
                          {processing === o.id
                            ? <Loader2 className="animate-spin" style={{ width: 11, height: 11 }} />
                            : <CheckCircle2 style={{ width: 11, height: 11 }} />}
                          Mark Paid
                        </button>
                      )}
                      {o.paymentStatus === "PAID" && (
                        <button
                          onClick={() => markAs(o.id, "REFUNDED")}
                          disabled={processing === o.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px", fontSize: 11, fontWeight: 600,
                            color: t.textMuted, background: t.borderLight,
                            border: "none", borderRadius: 3,
                            cursor: processing === o.id ? "default" : "pointer",
                            opacity: processing === o.id ? 0.5 : 1,
                          }}
                        >
                          {processing === o.id
                            ? <Loader2 className="animate-spin" style={{ width: 11, height: 11 }} />
                            : <RefreshCw style={{ width: 11, height: 11 }} />}
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
      </div>
    </>
  );
}