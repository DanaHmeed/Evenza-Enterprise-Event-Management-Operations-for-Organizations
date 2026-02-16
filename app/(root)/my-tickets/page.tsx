// app/(root)/my-tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  Loader2,
  Calendar,
  MapPin,
  Globe,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ExternalLink,
  Search,
} from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber: string;
  qrCode?: string | null;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    venueName?: string | null;
    city?: string | null;
    banner?: string | null;
  };
  createdAt: string;
}

type TabFilter = "ALL" | "UPCOMING" | "PAST" | "CANCELLED";

export default function MyTicketsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/my-tickets");
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}/tickets`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.data || []);
        }
      } catch {
        console.error("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isLoaded, isSignedIn, user, router]);

  const now = new Date();

  const filtered = tickets.filter((t) => {
    const matchesSearch = t.event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isUpcoming = new Date(t.event.startDate) > now;
    const isPast = new Date(t.event.endDate) < now;
    const isCancelled = t.status === "CANCELLED" || t.status === "REFUNDED";

    switch (tab) {
      case "UPCOMING": return matchesSearch && isUpcoming && !isCancelled;
      case "PAST": return matchesSearch && isPast && !isCancelled;
      case "CANCELLED": return matchesSearch && isCancelled;
      default: return matchesSearch;
    }
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const getStatusStyle = (status: string, checkedIn: boolean) => {
    if (checkedIn) return { bg: "bg-blue-100", text: "text-blue-700", label: "Checked In" };
    const map: Record<string, { bg: string; text: string; label: string }> = {
      VALID: { bg: "bg-green-100", text: "text-green-700", label: "Valid" },
      PAID: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
      USED: { bg: "bg-blue-100", text: "text-blue-700", label: "Used" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
      REFUNDED: { bg: "bg-gray-100", text: "text-gray-600", label: "Refunded" },
      PENDING: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
    };
    return map[status] || { bg: "bg-gray-100", text: "text-gray-600", label: status };
  };

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} in your account.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(["ALL", "UPCOMING", "PAST", "CANCELLED"] as TabFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No tickets found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {tickets.length === 0
                ? "Register for events to get your tickets here."
                : "Try a different filter or search."}
            </p>
            <Link
              href="/events"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Browse Events →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => {
              const style = getStatusStyle(ticket.status, ticket.checkedIn);
              const isUpcoming = new Date(ticket.event.startDate) > now;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Event thumbnail */}
                    <div className="sm:w-36 h-24 sm:h-auto bg-gray-100 flex-shrink-0">
                      {ticket.event.banner ? (
                        <img
                          src={ticket.event.banner}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-orange-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                          {isUpcoming && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                              UPCOMING
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/events/${ticket.event.id}`}
                          className="text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1"
                        >
                          {ticket.event.title}
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(ticket.event.startDate)} at {formatTime(ticket.event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            {ticket.event.isOnline ? (
                              <Globe className="w-3 h-3" />
                            ) : (
                              <MapPin className="w-3 h-3" />
                            )}
                            {ticket.event.isOnline ? "Online" : ticket.event.city || ticket.event.venueName || "TBA"}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400 font-mono mt-1.5">
                          #{ticket.ticketNumber}
                        </p>
                      </div>

                      {/* QR / Actions */}
                      <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all"
                          title="Show QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/events/${ticket.event.id}`}
                          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
                          title="View Event"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* QR Expanded */}
                  {selectedTicket?.id === ticket.id && (
                    <div className="border-t border-gray-100 p-6 text-center bg-gray-50">
                      {ticket.qrCode ? (
                        <div className="inline-block bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <img
                            src={ticket.qrCode}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                          />
                        </div>
                      ) : (
                        <div className="inline-block bg-white p-8 rounded-xl border border-gray-200">
                          <QrCode className="w-20 h-20 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">QR code will appear here</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-3 font-mono">
                        Ticket #{ticket.ticketNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Show this at the event entrance for check-in.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}