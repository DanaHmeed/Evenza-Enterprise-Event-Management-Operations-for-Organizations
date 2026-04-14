// app/admin/feedback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
} from "lucide-react";
import { t, StatusBadge, AdminPagination, AdminEmpty, AdminLoading } from "@/components/admin/AdminUI";

interface FeedbackData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string | null };
  event: { id: string; title: string };
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function AdminFeedbackPage() {
  const searchParams = useSearchParams();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "ALL"
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchFeedbacks(); }, [page, statusFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchFeedbacks(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch { /* */ } finally { setLoading(false); }
  };

  const moderate = async (id: string, action: "APPROVED" | "REJECTED") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: action } : f)));
    } catch { alert("Failed to update"); }
    finally { setProcessing(null); }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (res.ok) setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch { alert("Failed to delete"); }
    finally { setProcessing(null); }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filters: StatusFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: t.text, margin: 4 }}>Feedback</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px", marginLeft: 4 }}>
          {total} total reviews.
          {feedbacks.filter((f) => f.status === "PENDING").length > 0 && (
            <span style={{ color: t.amber, fontWeight: 600, marginLeft: "6px" }}>
              {feedbacks.filter((f) => f.status === "PENDING").length} pending
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: t.textFaint }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or event..."
            style={{ width: "100%", padding: "9px 14px 9px 34px", fontSize: "13px",  border: `1px solid ${t.border}`, borderRadius: "4px", outline: "none", color: t.text, background: t.surface }}
          />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 500, 
                border: `1px solid ${statusFilter === s ? t.text : t.border}`, borderRadius: "4px",
                background: statusFilter === s ? t.text : t.surface,
                color: statusFilter === s ? "#fff" : t.textMuted, cursor: "pointer",
              }}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? <AdminLoading /> : feedbacks.length === 0 ? (
        <AdminEmpty icon={<MessageSquare style={{ width: "32px", height: "32px" }} />} message="No feedback found." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {feedbacks.map((fb) => {
            const expanded = expandedId === fb.id;
            return (
              <div
                key={fb.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${fb.status === "PENDING" ? t.border : t.borderLight}`,
                  borderLeft: fb.status === "PENDING" ? `3px solid ${t.amber}` : undefined,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(expanded ? null : fb.id)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Avatar */}
                  {fb.user.avatar ? (
                    <img src={fb.user.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                      {fb.user.name.charAt(0)}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>{fb.user.name}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      on {fb.event.title}
                    </p>
                  </div>

                  {/* Stars */}
                  <div style={{ display: "flex", gap: "1px", flexShrink: 0 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        style={{ width: "12px", height: "12px" }}
                        className={j < fb.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"}
                      />
                    ))}
                  </div>

                  <StatusBadge status={fb.status} />
                  <span style={{ fontSize: "11px", color: t.textFaint, flexShrink: 0 }}>{fmtDate(fb.createdAt)}</span>
                  {expanded ? (
                    <ChevronUp style={{ width: "14px", height: "14px", color: t.textFaint, flexShrink: 0 }} />
                  ) : (
                    <ChevronDown style={{ width: "14px", height: "14px", color: t.textFaint, flexShrink: 0 }} />
                  )}
                </div>

                {/* Expanded */}
                {expanded && (
                  <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${t.borderLight}`, paddingTop: "16px" }}>
                    {fb.title && <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: "0 0 6px" }}>{fb.title}</p>}
                    <p style={{ fontSize: "14px", color: fb.comment ? t.textSecondary : t.textFaint, lineHeight: 1.7, margin: "0 0 16px", fontStyle: fb.comment ? "normal" : "italic", whiteSpace: "pre-wrap" }}>
                      {fb.comment || "No comment provided."}
                    </p>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {fb.status === "PENDING" && (
                        <>
                          <ActionBtn label="Approve" color={t.green} bg={t.greenSoft} icon={<CheckCircle2 />} loading={processing === fb.id} onClick={() => moderate(fb.id, "APPROVED")} />
                          <ActionBtn label="Reject" color={t.accent} bg={t.accentSoft} icon={<XCircle />} loading={processing === fb.id} onClick={() => moderate(fb.id, "REJECTED")} />
                        </>
                      )}
                      {fb.status === "APPROVED" && (
                        <ActionBtn label="Revoke" color={t.amber} bg={t.amberSoft} icon={<XCircle />} loading={processing === fb.id} onClick={() => moderate(fb.id, "REJECTED")} />
                      )}
                      {fb.status === "REJECTED" && (
                        <ActionBtn label="Approve" color={t.green} bg={t.greenSoft} icon={<CheckCircle2 />} loading={processing === fb.id} onClick={() => moderate(fb.id, "APPROVED")} />
                      )}
                      <div style={{ marginLeft: "auto" }}>
                        <ActionBtn label="Delete" color={t.accent} bg={t.accentSoft} icon={<Trash2 />} loading={processing === fb.id} onClick={() => deleteFeedback(fb.id)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function ActionBtn({ label, color, bg, icon, loading, onClick }: { label: string; color: string; bg: string; icon: React.ReactNode; loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px",
        fontSize: "12px", fontWeight: 600, 
        color, background: bg, border: "none", borderRadius: "4px",
        cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <Loader2 className="animate-spin" style={{ width: "12px", height: "12px" }} />
      ) : (
        <span style={{ width: "12px", height: "12px", display: "flex" }}>{icon}</span>
      )}
      {label}
    </button>
  );
}