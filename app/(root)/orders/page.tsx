// app/(root)/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  MapPin,
  Globe,
  Loader2,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    banner: string | null;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    city: string | null;
    venueName: string | null;
  };
}

export default function OrdersPage() {
  const { isSignedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!isSignedIn) return;
    fetchOrders();
  }, [isSignedIn, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getStatusConfig = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      PAID: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-700",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        label: "Paid",
      },
      PENDING: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Pending",
      },
      FAILED: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-600",
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Failed",
      },
      REFUNDED: {
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-600",
        icon: <RefreshCw className="w-3.5 h-3.5" />,
        label: "Refunded",
      },
    };
    return map[status] || map.PENDING;
  };

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => {
      const amount = typeof o.amount === "object" ? Number(o.amount) : o.amount;
      return sum + amount;
    }, 0);

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-500">Your purchase history and payment details.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-5 py-4">
            <p className="text-2xl font-bold text-green-600">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">
              {orders.filter((o) => o.paymentStatus === "PAID").length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["ALL", "PAID", "PENDING", "FAILED", "REFUNDED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {s === "ALL" ? "All Orders" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              When you purchase event tickets, they&apos;ll appear here.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.paymentStatus);
              const amount = typeof order.amount === "object"
                ? Number(order.amount)
                : order.amount;

              return (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Event thumbnail */}
                    <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      {order.event.banner ? (
                        <img
                          src={order.event.banner}
                          alt={order.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center min-h-[120px]">
                          <Calendar className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Order details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/events/${order.event.id}`}
                            className="text-base font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1"
                          >
                            {order.event.title}
                          </Link>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {order.orderNumber}
                          </p>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Event info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(order.event.startDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {order.event.isOnline ? (
                            <Globe className="w-3.5 h-3.5" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5" />
                          )}
                          {order.event.isOnline
                            ? "Online"
                            : order.event.city || order.event.venueName || "TBA"}
                        </span>
                      </div>

                      {/* Price + actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ${amount.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            {order.currency}
                          </span>
                          {order.paidAt && (
                            <span className="text-xs text-gray-400 ml-3">
                              Paid {formatDate(order.paidAt)}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/events/${order.event.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          View Event
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}