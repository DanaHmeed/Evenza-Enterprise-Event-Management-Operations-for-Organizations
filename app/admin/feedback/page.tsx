// app/admin/feedback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Search,
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarDays,
  Trash2,
} from "lucide-react";

interface FeedbackData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  event: {
    id: string;
    title: string;
  };
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminFeedbackPage() {
  const searchParams = useSearchParams();

  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchFeedbacks();
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      console.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (feedbackId: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(feedbackId);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, status: action } : f))
        );
      }
    } catch {
      alert("Failed to update feedback");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm("Delete this feedback permanently?")) return;
    setProcessing(feedbackId);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, { method: "DELETE" });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
      }
    } catch {
      alert("Failed to delete feedback");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
      PENDING: { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock className="w-3 h-3" /> },
      REJECTED: { bg: "bg-red-100", text: "text-red-600", icon: <XCircle className="w-3 h-3" /> },
    };
    return map[status] || map.PENDING;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const pendingCount = feedbacks.filter((f) => f.status === "PENDING").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} total reviews.
          {pendingCount > 0 && (
            <span className="text-amber-600 font-semibold ml-1">
              {pendingCount} pending approval.
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user or event..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === s
                  ? s === "PENDING"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-orange-50 text-orange-600 border border-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No feedback found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => {
            const badge = getStatusBadge(fb.status);
            const isExpanded = expandedId === fb.id;

            return (
              <div
                key={fb.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {fb.user.avatar ? (
                      <img src={fb.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs flex-shrink-0">
                        {fb.user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{fb.user.name}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        on <span className="font-medium text-gray-700">{fb.event.title}</span>
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`w-3.5 h-3.5 ${j < fb.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Status */}
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                    {badge.icon}
                    {fb.status}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {formatDate(fb.createdAt)}
                  </span>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                    {fb.title && (
                      <p className="text-sm font-semibold text-gray-900 mb-1">{fb.title}</p>
                    )}
                    {fb.comment ? (
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
                        {fb.comment}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-4">No comment provided.</p>
                    )}

                    <div className="flex items-center gap-2">
                      {fb.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleModerate(fb.id, "APPROVED")}
                            disabled={processing === fb.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {processing === fb.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleModerate(fb.id, "REJECTED")}
                            disabled={processing === fb.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {fb.status === "REJECTED" && (
                        <button
                          onClick={() => handleModerate(fb.id, "APPROVED")}
                          disabled={processing === fb.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Instead
                        </button>
                      )}
                      {fb.status === "APPROVED" && (
                        <button
                          onClick={() => handleModerate(fb.id, "REJECTED")}
                          disabled={processing === fb.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Revoke Approval
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(fb.id)}
                        disabled={processing === fb.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-50 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white border border-gray-200 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}