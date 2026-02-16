// app/dashboard/events/[eventId]/attendees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  UserCheck,
  UserX,
  ScanLine,
  Download,
  Ban,
} from "lucide-react";

interface Attendee {
  id: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  ticket?: {
    id: string;
    ticketNumber: string;
    status: string;
  } | null;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  checkedIn: number;
}

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendees();
    fetchEventTitle();
  }, [eventId]);

  const fetchEventTitle = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEventTitle(data.data?.title || data.title || "Event");
      }
    } catch {}
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`);
      if (res.ok) {
        const data = await res.json();
        setAttendees(data.data?.attendees || []);
        setStats(data.data?.stats || null);
      }
    } catch {
      console.error("Failed to fetch attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (registrationId: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(registrationId);
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, status: action }),
      });
      if (res.ok) {
        await fetchAttendees();
      }
    } catch {
      alert(`Failed to ${action.toLowerCase()} registration`);
    } finally {
      setProcessing(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Status", "Ticket #", "Checked In", "Registered At"];
    const rows = attendees.map((a) => [
      a.user.name,
      a.user.email,
      a.status,
      a.ticket?.ticketNumber || "N/A",
      a.checkedIn ? "Yes" : "No",
      new Date(a.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter
  const filtered = attendees.filter((a) => {
    const matchesSearch =
      a.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
      PENDING: { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
      CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", icon: <Ban className="w-3 h-3" /> },
    };
    return map[status] || map.PENDING;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/events"
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{eventTitle}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/scanner?eventId=${eventId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            Scanner
          </Link>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-gray-900" },
            { label: "Approved", value: stats.approved, color: "text-green-600" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
            { label: "Cancelled", value: stats.cancelled, color: "text-gray-500" },
            { label: "Checked In", value: stats.checkedIn, color: "text-blue-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "APPROVED", "PENDING", "REJECTED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No attendees found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Attendee</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Ticket</div>
            <div className="col-span-2">Checked In</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.map((attendee) => {
              const badge = getStatusBadge(attendee.status);
              return (
                <div
                  key={attendee.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                >
                  {/* Attendee */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    {attendee.user.avatar ? (
                      <img
                        src={attendee.user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-xs">
                        {attendee.user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {attendee.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {attendee.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                    >
                      {badge.icon}
                      {attendee.status}
                    </span>
                  </div>

                  {/* Ticket */}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-700 font-mono">
                      {attendee.ticket?.ticketNumber || "—"}
                    </p>
                  </div>

                  {/* Check-in */}
                  <div className="md:col-span-2">
                    {attendee.checkedIn ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Checked In
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not yet</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-1">
                    {attendee.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApproval(attendee.id, "APPROVED")}
                          disabled={processing === attendee.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {processing === attendee.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(attendee.id, "REJECTED")}
                          disabled={processing === attendee.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <UserX className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}