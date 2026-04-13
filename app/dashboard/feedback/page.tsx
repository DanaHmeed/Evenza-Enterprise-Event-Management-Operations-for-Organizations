// app/dashboard/feedback/page.tsx
"use client";

import { useState } from "react";
import { MessageSquare, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useOrganizerFeedbacks } from "@/hooks/use-dashboard";

// ── Color tokens (same as dashboard) ─────────────────────────────────────────
const c = {
  a50:"#FAEEDA", a100:"#FAC775", a200:"#EF9F27", a600:"#854F0B", a800:"#633806",
  g50:"#EAF3DE", g600:"#3B6D11", g800:"#27500A",
  c50:"#FAECE7", c100:"#F5C4B3", c600:"#993C1D",
  p50:"#EEEDFE", p600:"#534AB7", p800:"#3C3489",
  b50:"#E6F1FB", b600:"#185FA5",
  gr200:"#B4B2A9", gr400:"#888780",
} as const;

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; fg: string; label: string }> = {
  APPROVED: { bg: c.g50,  fg: c.g800,  label: "Approved"  },
  PENDING:  { bg: c.a50,  fg: c.a800,  label: "Pending"   },
  REJECTED: { bg: c.c50,  fg: c.c600,  label: "Rejected"  },
};
const getStatus = (k: string) => STATUS_CFG[k] ?? STATUS_CFG.PENDING;

// ── Star row ──────────────────────────────────────────────────────────────────
function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{
            width: size, height: size,
            fill:   i < rating ? c.a200 : "transparent",
            color:  i < rating ? c.a200 : "var(--color-border-tertiary,#e8e8e8)",
          }}
        />
      ))}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  if (avatar) {
    return (
      <img src={avatar} alt=""
        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: "var(--color-background-secondary,#f5f5f5)",
      border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 500,
      color: "var(--color-text-secondary,#666)",
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrganizerFeedbackPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage]             = useState(1);

  const { feedbacks, stats, pagination, isLoading } = useOrganizerFeedbacks({
    page,
    pageSize: 20,
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 60px" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        paddingBottom: 18,
        borderBottom: "1px solid var(--color-border-tertiary,#e8e8e8)",
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
          color: "var(--color-text-primary,#111)",
        }}>Feedback</div>
        <div style={{
          fontSize: 11, letterSpacing: "0.04em",
          color: "var(--color-text-tertiary,#999)", marginTop: 3,
        }}>Reviews from your event attendees.</div>
      </div>

      {/* ── Stat strip ────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: "1px",
        background: "var(--color-border-tertiary,#e8e8e8)",
        border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
        borderRadius: 8, overflow: "hidden", marginBottom: 20,
      }}>
        {[
          { n: stats?.total     ?? 0,                                    l: "total reviews",  hl: false },
          { n: stats?.approved  ?? 0,                                    l: "approved",        hl: false },
          { n: stats?.averageRating ? `${stats.averageRating}/5` : "—",  l: "avg. rating",    hl: true  },
        ].map((item, i) => (
          <div key={i} style={{
            background: item.hl
              ? c.a50
              : "var(--color-background-primary,#fff)",
            padding: "12px 10px", textAlign: "center",
          }}>
            <div style={{
              fontSize: 20, fontWeight: 500, lineHeight: 1, marginBottom: 4,
              color: item.hl ? c.a600 : "var(--color-text-primary,#111)",
            }}>{String(item.n)}</div>
            <div style={{
              fontSize: 10, letterSpacing: "0.04em",
              color: item.hl ? c.a600 : "var(--color-text-secondary,#666)",
            }}>{item.l}</div>
          </div>
        ))}
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {isLoading && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 200,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: `2px solid var(--color-border-tertiary,#e8e8e8)`,
            borderTopColor: c.a600,
            animation: "spin 0.7s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!isLoading && feedbacks.length === 0 && (
        <div style={{
          border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
          borderRadius: 12, padding: "60px 20px",
          textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--color-background-secondary,#f5f5f5)",
            border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            color: "var(--color-text-tertiary,#999)",
          }}>
            <MessageSquare style={{ width: 20, height: 20 }} />
          </div>
          <div style={{
            fontSize: 13, fontWeight: 500,
            color: "var(--color-text-primary,#111)", marginBottom: 4,
          }}>No feedback yet</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary,#999)" }}>
            Reviews will appear here after your events.
          </div>
        </div>
      )}

      {/* ── Feedback list ─────────────────────────────────────────────────── */}
      {!isLoading && feedbacks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {feedbacks.map((fb: {
            id: string;
            rating: number;
            title?: string | null;
            comment?: string | null;
            status: string;
            createdAt: string;
            user: { name: string; avatar?: string | null };
            event: { id: string; title: string };
          }) => {
            const expanded = expandedId === fb.id;
            const s = getStatus(fb.status);

            return (
              <div key={fb.id} style={{
                border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                borderRadius: 12, overflow: "hidden",
                background: "var(--color-background-primary,#fff)",
              }}>
                {/* ── Row ─────────────────────────────────────────────────── */}
                <div
                  onClick={() => setExpandedId(expanded ? null : fb.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto auto auto auto",
                    gap: 12, alignItems: "center",
                    padding: "12px 16px", cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Avatar name={fb.user.name} avatar={fb.user.avatar} />

                  {/* name + event */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      color: "var(--color-text-primary,#111)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{fb.user.name}</div>
                    <div style={{
                      fontSize: 11, color: "var(--color-text-tertiary,#999)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      marginTop: 1,
                    }}>on {fb.event.title}</div>
                  </div>

                  {/* stars */}
                  <StarRow rating={fb.rating} />

                  {/* status badge */}
                  <span style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 100,
                   whiteSpace: "nowrap",
                    background: s.bg, color: s.fg,
                  }}>{s.label}</span>

                  {/* date */}
                  <span style={{
                    fontSize: 11, 
                    color: "var(--color-text-tertiary,#999)", flexShrink: 0,
                  }}>{fmtDate(fb.createdAt)}</span>

                  {/* expand toggle */}
                  <div style={{ color: "var(--color-text-tertiary,#999)", flexShrink: 0 }}>
                    {expanded
                      ? <ChevronUp  style={{ width: 14, height: 14 }} />
                      : <ChevronDown style={{ width: 14, height: 14 }} />}
                  </div>
                </div>

                {/* ── Expanded body ────────────────────────────────────────── */}
                {expanded && (
                  <div style={{
                    padding: "14px 16px 16px",
                    borderTop: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                    background: "var(--color-background-secondary,#f5f5f5)",
                  }}>
                    {/* rating + title row */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                    }}>
                      <StarRow rating={fb.rating} size={14} />
                      {fb.title && (
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: "var(--color-text-primary,#111)",
                        }}>{fb.title}</span>
                      )}
                    </div>

                    {/* comment */}
                    <p style={{
                      fontSize: 13, lineHeight: 1.65, margin: 0,
                      color: fb.comment
                        ? "var(--color-text-secondary,#666)"
                        : "var(--color-text-tertiary,#999)",
                      fontStyle: fb.comment ? "normal" : "italic",
                      whiteSpace: "pre-wrap",
                    }}>
                      {fb.comment || "No comment provided."}
                    </p>

                    {/* meta footer */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 16,
                      marginTop: 12, paddingTop: 12,
                      borderTop: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
                    }}>
                      <span style={{
                        fontSize: 10, 
                        color: "var(--color-text-tertiary,#999)",
                      }}>Event: {fb.event.title}</span>
                      <span style={{
                        fontSize: 10, 
                        color: "var(--color-text-tertiary,#999)",
                      }}>{fmtDate(fb.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginTop: 24,
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
              background: "var(--color-background-primary,#fff)",
              color: page === 1
                ? "var(--color-text-tertiary,#999)"
                : "var(--color-text-primary,#111)",
              cursor: page === 1 ? "not-allowed" : "pointer",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (page !== 1) e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-background-primary,#fff)"; }}
          >← Prev</button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} style={{
                  fontSize: 12, color: "var(--color-text-tertiary,#999)",
                  padding: "6px 4px",
                }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: "0.5px solid",
                    borderColor: page === p
                      ? "var(--color-text-primary,#111)"
                      : "var(--color-border-tertiary,#e8e8e8)",
                    background: page === p
                      ? "var(--color-text-primary,#111)"
                      : "var(--color-background-primary,#fff)",
                    color: page === p
                      ? "var(--color-background-primary,#fff)"
                      : "var(--color-text-primary,#111)",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >{p}</button>
              )
            )}

          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "0.5px solid var(--color-border-tertiary,#e8e8e8)",
              background: "var(--color-background-primary,#fff)",
              color: page === pagination.totalPages
                ? "var(--color-text-tertiary,#999)"
                : "var(--color-text-primary,#111)",
              cursor: page === pagination.totalPages ? "not-allowed" : "pointer",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (page !== pagination.totalPages) e.currentTarget.style.background = "var(--color-background-secondary,#f5f5f5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-background-primary,#fff)"; }}
          >Next →</button>
        </div>
      )}

    </div>
  );
}