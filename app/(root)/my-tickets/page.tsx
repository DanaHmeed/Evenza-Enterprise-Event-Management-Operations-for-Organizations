// app/(root)/my-tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  MapPin,
  Globe,
  Loader2,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber: string;
  status: string;
  qrCode?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    banner?: string | null;
    startDate: string;
    endDate: string;
    isOnline: boolean;
    venueName?: string | null;
    city?: string | null;
  };
  registration?: {
    status: string;
    checkedIn: boolean;
  } | null;
}

export default function MyTicketsPage() {
  const { user, isSignedIn } = useUser();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const fetchTickets = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/tickets`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.data || []);
        }
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchTickets();
  }, [isSignedIn, user]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const isPast = (d: string) => new Date(d) < new Date();

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    VALID: { color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    USED: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    RESERVED: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
    CANCELLED: { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: <XCircle className="w-3.5 h-3.5" /> },
    REFUNDED: { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  const upcoming = tickets.filter((t) => !isPast(t.event.endDate) && t.status === "VALID");
  const past = tickets.filter((t) => isPast(t.event.endDate) || t.status !== "VALID");

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          </div>
          <p className="text-gray-500">Your event tickets and check-in details.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-sm text-gray-500 mb-6">When you register or purchase tickets, they&apos;ll appear here.</p>
            <Link href="/events" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Upcoming ({upcoming.length})</h2>
                <div className="space-y-4">
                  {upcoming.map((ticket) => {
                    const ss = statusConfig[ticket.status] || statusConfig.RESERVED;
                    return (
                      <div key={ticket.id} className="border border-orange-200 bg-white rounded-xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-44 h-28 sm:h-auto flex-shrink-0 relative">
                            {ticket.event.banner ? (
                              <img src={ticket.event.banner} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center min-h-[100px]">
                                <Ticket className="w-6 h-6 text-white/20" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">Upcoming</div>
                          </div>
                          <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 min-w-0">
                              <Link href={`/events/${ticket.event.id}`} className="text-base font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">{ticket.event.title}</Link>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{fmtDate(ticket.event.startDate)}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{fmtTime(ticket.event.startDate)}</span>
                                <span className="flex items-center gap-1.5">{ticket.event.isOnline ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}{ticket.event.isOnline ? "Online" : ticket.event.city || ticket.event.venueName || "TBA"}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">{ticket.ticketNumber}</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${ss.bg} ${ss.color}`}>{ss.icon}{ticket.status}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center sm:border-l sm:border-dashed sm:border-gray-200 sm:pl-4 gap-2">
                              <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                <QrCode className="w-8 h-8 text-gray-300" />
                              </div>
                              <Link href={`/events/${ticket.event.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700">
                                View <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Past & Other ({past.length})</h2>
                <div className="space-y-3">
                  {past.map((ticket) => {
                    const ss = statusConfig[ticket.status] || statusConfig.RESERVED;
                    return (
                      <div key={ticket.id} className="border border-gray-200 bg-white rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {ticket.event.banner ? (
                            <img src={ticket.event.banner} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Ticket className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/events/${ticket.event.id}`} className="text-sm font-semibold text-gray-900 hover:text-orange-600 truncate block">{ticket.event.title}</Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{fmtDate(ticket.event.startDate)}</span>
                            <span className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ss.bg} ${ss.color}`}>{ss.icon}{ticket.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}