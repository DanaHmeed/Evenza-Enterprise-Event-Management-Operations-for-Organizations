// app/dashboard/revenue/page.tsx
"use client";

import { useState, useCallback } from "react";
import { CreditCard, Search } from "lucide-react";
import {
  t,
  StatusBadge,
  StatCard,
  FilterButton,
  OrganizerLoading,
  OrganizerEmpty,
  OrganizerPagination,
} from "@/components/dashboard/OrganizerUI";
import { useOrganizerOrders } from "@/hooks/use-dashboard";

type Filter = "ALL" | "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export default function OrganizerRevenuePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400)
    );
  }, [debounceTimer]);

  // ONE request — server handles filtering, search, pagination
  const { orders, stats, pagination, isLoading } = useOrganizerOrders({
    page,
    status: filter,
    search: debouncedSearch,
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const methodLabel: Record<string, string> = {
    STRIPE: "Stripe",
    CASH: "Cash",
    BANK_TRANSFER: "Bank",
    JAWWAL_PAY: "Jawwal",
  };

  const filters: Filter[] = ["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"];

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>
          Revenue
        </h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>
          Payment history across your events.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          sub={`${stats?.paidCount ?? 0} paid orders`}
        />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
        <StatCard label="Pending" value={stats?.pendingCount ?? 0} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search user or event..."
            style={{
              width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px",
              fontFamily: t.sans, border: `1px solid ${t.border}`, borderRadius: "4px",
              outline: "none", color: t.text, background: t.surface,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
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

      {isLoading ? (
        <OrganizerLoading />
      ) : orders.length === 0 ? (
        <OrganizerEmpty
          icon={<CreditCard style={{ width: "32px", height: "32px" }} />}
          message="No orders found."
        />
      ) : (
        <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", overflow: "hidden" }}>
          <div
            className="hidden md:grid"
            style={{
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
              gap: "8px", padding: "10px 20px", background: t.borderLight,
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase" as const,
              letterSpacing: "0.08em", color: t.textFaint,
            }}
          >
            <span>User</span>
            <span>Event</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {orders.map((o: {
            id: string;
            amount: number;
            paymentMethod: string;
            paymentStatus: string;
            createdAt: string;
            user: { name: string; email: string };
            event: { id: string; title: string };
          }, i: number) => (
            <div
              key={o.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                gap: "8px", padding: "12px 20px", alignItems: "center",
                borderTop: i > 0 ? `1px solid ${t.borderLight}` : "none",
                transition: "background 0.1s",
              }}
              className="grid-cols-1 md:grid-cols-none"
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {o.user.name}
                </p>
                <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>{o.user.email}</p>
              </div>
              <p style={{ fontSize: "13px", color: t.textSecondary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.event.title}
              </p>
              <span style={{ fontSize: "12px", color: t.textMuted }}>
                {methodLabel[o.paymentMethod] || o.paymentMethod}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: t.text, fontVariantNumeric: "tabular-nums" }}>
                ${o.amount}
              </span>
              <StatusBadge status={o.paymentStatus} />
              <span style={{ fontSize: "12px", color: t.textFaint }}>{fmtDate(o.createdAt)}</span>
            </div>
          ))}
        </div>
      )}

      <OrganizerPagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}