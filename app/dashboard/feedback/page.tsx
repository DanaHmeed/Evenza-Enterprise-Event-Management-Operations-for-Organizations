// app/dashboard/feedback/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
import { t, StatusBadge, SectionTitle, StatCard, OrganizerLoading, OrganizerEmpty } from "@/components/dashboard/OrganizerUI";

interface Feedback {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status: string;
  createdAt: string;
  user: { name: string; avatar?: string | null };
  event: { id: string; title: string };
}

export default function OrganizerFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch organizer events, then feedback per event
        const evRes = await fetch("/api/organizer/events?pageSize=100");
        if (!evRes.ok) return;
        const evData = await evRes.json();
        const events = evData.data || [];

        const all: Feedback[] = [];
        await Promise.all(
          events.map(async (ev: { id: string; title: string }) => {
            try {
              const res = await fetch(`/api/events/${ev.id}/feedback`);
              if (res.ok) {
                const data = await res.json();
                (data.data?.feedbacks || []).forEach((fb: Feedback) => {
                  all.push({ ...fb, event: { id: ev.id, title: ev.title } });
                });
              }
            } catch { /* skip */ }
          })
        );

        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFeedbacks(all);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const approved = feedbacks.filter((f) => f.status === "APPROVED");
  const avgRating = approved.length > 0
    ? Math.round(approved.reduce((s, f) => s + f.rating, 0) / approved.length * 10) / 10
    : 0;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: t.sans }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Feedback</h1>
        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>Reviews from your event attendees.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        <StatCard label="Total Reviews" value={feedbacks.length} />
        <StatCard label="Approved" value={approved.length} />
        <StatCard label="Avg Rating" value={avgRating ? `${avgRating}/5` : "—"} />
      </div>

      {loading ? <OrganizerLoading /> : feedbacks.length === 0 ? (
        <OrganizerEmpty icon={<MessageSquare style={{ width: "32px", height: "32px" }} />} message="No feedback yet. Reviews will appear here after events." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {feedbacks.map((fb) => {
            const expanded = expandedId === fb.id;
            return (
              <div key={fb.id} style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: "6px", overflow: "hidden" }}>
                <div
                  onClick={() => setExpandedId(expanded ? null : fb.id)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {fb.user.avatar ? (
                    <img src={fb.user.avatar} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: t.borderLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                      {fb.user.name.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>{fb.user.name}</p>
                    <p style={{ fontSize: "11px", color: t.textFaint, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>on {fb.event.title}</p>
                  </div>
                  <div style={{ display: "flex", gap: "1px", flexShrink: 0 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} style={{ width: "12px", height: "12px" }} className={j < fb.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <StatusBadge status={fb.status} />
                  <span style={{ fontSize: "11px", color: t.textFaint, flexShrink: 0 }}>{fmtDate(fb.createdAt)}</span>
                  {expanded ? <ChevronUp style={{ width: "14px", height: "14px", color: t.textFaint }} /> : <ChevronDown style={{ width: "14px", height: "14px", color: t.textFaint }} />}
                </div>
                {expanded && (
                  <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${t.borderLight}`, paddingTop: "16px" }}>
                    {fb.title && <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: "0 0 6px" }}>{fb.title}</p>}
                    <p style={{ fontSize: "14px", color: fb.comment ? t.textSecondary : t.textFaint, lineHeight: 1.7, margin: 0, fontStyle: fb.comment ? "normal" : "italic", whiteSpace: "pre-wrap" }}>
                      {fb.comment || "No comment provided."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}