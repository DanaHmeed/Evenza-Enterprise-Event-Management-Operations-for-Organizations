// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Search, Loader2, ExternalLink } from "lucide-react";
import { t, StatusBadge, SectionTitle, AdminPagination, AdminEmpty, AdminLoading } from "@/components/admin/AdminUI";

interface OrderData {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
  event: { id: string; title: string };
}

type StatusFilter = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchOrders(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const methodLabel: Record<string, string> = {
    STRIPE: "Stripe",
    CASH: "Cash",
    BANK_TRANSFER: "Bank",
    JAWWAL_PAY: "Jawwal",
  };

  return (
    <div >
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: t.text, margin: 4 }}>Orders</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px", marginLeft:4 }}>{total} total orders on the platform.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or event..."
            style={{
              width: "100%",
              padding: "9px 14px 9px 34px",
              fontSize: "13px",
             // fontFamily: 'Quicksand',
              border: `1px solid ${t.border}`,
              borderRadius: "4px",
              outline: "none",
              color: t.text,
              background: t.surface,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              style={{
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 500,
                //fontFamily: 'Quicksand',
                border: `1px solid ${status === s ? t.text : t.border}`,
                borderRadius: "4px",
                background: status === s ? t.text : t.surface,
                color: status === s ? "#fff" : t.textMuted,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : orders.length === 0 ? (
        <AdminEmpty
          icon={<DollarSign style={{ width: "32px", height: "32px" }} />}
          message="No orders found."
        />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "4px", overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
              gap: "8px",
              padding: "10px 20px",
              background: t.borderLight,
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: t.textFaint,
            }}
            className="hidden lg:grid"
          >
            <span>User</span>
            <span>Event</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {orders.map((order, i) => (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                gap: "8px",
                padding: "14px 20px",
                alignItems: "center",
                borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                fontSize: "13px",
                transition: "background 0.1s",
              }}
              className="grid-cols-1 lg:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.user.name}</p>
                <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{order.user.email}</p>
              </div>
              <p style={{ color: t.textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {order.event.title}
              </p>
              <span style={{ color: t.textMuted, fontSize: "12px" }}>{methodLabel[order.paymentMethod] || order.paymentMethod}</span>
              <span style={{ fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                ${order.amount} <span style={{ fontSize: "10px", color: t.textFaint }}>{order.currency}</span>
              </span>
              <StatusBadge status={order.paymentStatus} />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: t.textFaint }}>{fmtDate(order.createdAt)}</span>
                {order.receiptUrl && (
                  <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: t.textFaint }}>
                    <ExternalLink style={{ width: "12px", height: "12px" }} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}