//app/(root)/events/[id]/feedback/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, User } from "lucide-react";

/* ── Design tokens (mirrors EventDetailClient) ── */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  green: "#2d6a4f",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.06)",
  amberBorder: "rgba(180,83,9,0.15)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

/* ── Styles ── */
const FS = {
  reviewsSection: {
    borderTop: `1px solid ${t.borderLight}`,
    paddingTop: "40px",
  } as React.CSSProperties,
  reviewsHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "28px",
  } as React.CSSProperties,
  reviewsTitle: {
    fontFamily: t.serif,
    fontSize: "20px",
    fontWeight: 600,
    color: t.text,
    margin: 0,
  } as React.CSSProperties,
  reviewsStats: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
  } as React.CSSProperties,
  reviewsStarRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  } as React.CSSProperties,
  reviewsAvg: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.text,
  } as React.CSSProperties,
  reviewsCount: { fontSize: "13px", color: t.textMuted } as React.CSSProperties,
  reviewEmpty: {
    fontSize: "13px",
    color: t.textFaint,
    textAlign: "center" as const,
    padding: "48px 0",
  } as React.CSSProperties,
  reviewList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,

  feedbackCard: {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: "8px",
    padding: "28px",
    marginBottom: "28px",
  } as React.CSSProperties,
  feedbackFormTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: t.text,
    margin: "0 0 24px 0",
  } as React.CSSProperties,
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#777",
    marginBottom: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
  } as React.CSSProperties,
  fieldBlock: { marginBottom: "20px" } as React.CSSProperties,
  starsRow: {
    display: "flex",
    gap: "6px",
    marginTop: "2px",
  } as React.CSSProperties,
  starBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.12s",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: `1px solid ${t.border}`,
    borderRadius: "5px",
    outline: "none",
    fontFamily: t.sans,
    color: t.text,
    background: t.bg,
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: `1px solid ${t.border}`,
    borderRadius: "5px",
    outline: "none",
    fontFamily: t.sans,
    color: t.text,
    background: t.bg,
    resize: "none" as const,
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  formActions: { display: "flex", gap: "12px" } as React.CSSProperties,

  reviewCard: {
    background: t.surface,
    border: `1px solid ${t.borderLight}`,
    borderRadius: "8px",
    padding: "20px 24px",
  } as React.CSSProperties,
  reviewCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "12px",
  } as React.CSSProperties,
  reviewUserRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,
  reviewAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover" as const,
  },
  reviewAvatarFallback: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: t.borderLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  reviewUserName: {
    fontSize: "13px",
    fontWeight: 600,
    color: t.text,
    margin: 0,
  } as React.CSSProperties,
  reviewDate: {
    fontSize: "11px",
    color: t.textFaint,
    margin: 0,
  } as React.CSSProperties,
  reviewStars: { display: "flex", gap: "2px" } as React.CSSProperties,
  reviewTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: t.text,
    margin: "0 0 5px 0",
  } as React.CSSProperties,
  reviewComment: {
    fontSize: "13px",
    color: "#666",
    lineHeight: 1.65,
    margin: 0,
  } as React.CSSProperties,

  errorBanner: {
    marginBottom: "16px",
    padding: "12px 16px",
    borderRadius: "5px",
    fontSize: "13px",
    fontWeight: 500,
    background: "rgba(220,53,69,0.06)",
    border: "1px solid rgba(220,53,69,0.15)",
    color: t.accent,
  } as React.CSSProperties,
};

/* ── Types ── */
export interface FeedbackData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  pending?: boolean;
  user: { id: string; name: string; avatar?: string | null };
}

export interface FeedbackSectionProps {
  eventId: string;
  canLeaveFeedback: boolean;
  initialFeedbacks: FeedbackData[];
  initialStats: { count: number; averageRating: number };
  currentUser: { fullName?: string | null; imageUrl?: string | null } | null;
}

/* ── FeedbackSection component ── */
export default function FeedbackSection({
  eventId,
  canLeaveFeedback,
  initialFeedbacks,
  initialStats,
  currentUser,
}: FeedbackSectionProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [localFeedbacks, setLocalFeedbacks] =
    useState<FeedbackData[]>(initialFeedbacks);
  const [localStats, setLocalStats] = useState(initialStats);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canLeave = canLeaveFeedback && !hasSubmittedFeedback;

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) return;
    setSubmittingFeedback(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          rating: feedbackRating,
          title: feedbackTitle || undefined,
          comment: feedbackComment || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const newReview: FeedbackData = {
          id: `pending-${Date.now()}`,
          rating: feedbackRating,
          title: feedbackTitle || null,
          comment: feedbackComment || null,
          createdAt: new Date().toISOString(),
          pending: true,
          user: {
            id: "me",
            name: currentUser?.fullName || "You",
            avatar: currentUser?.imageUrl || null,
          },
        };
        setLocalFeedbacks((prev) => [newReview, ...prev]);
        setLocalStats((prev) => ({
          count: prev.count + 1,
          averageRating:
            Math.round(
              ((prev.averageRating * prev.count + feedbackRating) /
                (prev.count + 1)) *
                10,
            ) / 10,
        }));
        setHasSubmittedFeedback(true);
        setShowFeedbackForm(false);
        setFeedbackRating(0);
        setFeedbackTitle("");
        setFeedbackComment("");
      } else {
        setErrorMsg(data.error || "Failed to submit feedback");
      }
    } catch {
      setErrorMsg("Something went wrong");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div style={FS.reviewsSection}>
      <div style={FS.reviewsHeader}>
        <div>
          <h2 style={FS.reviewsTitle}>Reviews</h2>
          {localStats.count > 0 && (
            <div style={FS.reviewsStats}>
              <div style={FS.reviewsStarRow}>
                <Star
                  style={{
                    width: "14px",
                    height: "14px",
                    fill: "#d4a017",
                    color: "#d4a017",
                  }}
                />
                <span style={FS.reviewsAvg}>{localStats.averageRating}</span>
              </div>
              <span style={FS.reviewsCount}>
                ({localStats.count} review{localStats.count !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
        {canLeave && !showFeedbackForm && (
          <button
            onClick={() => setShowFeedbackForm(true)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#c62e3a";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 20px rgba(230,57,70,0.32)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                t.accent;
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 10px rgba(230,57,70,0.22)";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.97)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }}
            style={{
              padding: "8px 18px",
              background: t.accent,
              color: "#ffffff",
              fontFamily: t.serif,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: `0 2px 10px rgba(230,57,70,0.22)`,
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              outline: "none",
              whiteSpace: "nowrap" as const,
            }}
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Error banner */}
      {errorMsg && <div style={FS.errorBanner}>{errorMsg}</div>}

      {/* Feedback form */}
      {showFeedbackForm && (
        <div style={FS.feedbackCard}>
          <h3 style={FS.feedbackFormTitle}>Your Review</h3>

          <div style={FS.fieldBlock}>
            <label style={FS.fieldLabel}>Rating *</label>
            <div style={FS.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  style={FS.starBtn}
                  title={`${star} star${star !== 1 ? "s" : ""}`}
                >
                  <Star
                    style={{
                      width: "26px",
                      height: "26px",
                      fill: star <= feedbackRating ? "#d4a017" : "none",
                      color: star <= feedbackRating ? "#d4a017" : "#d0d0c8",
                      transition: "color 0.12s, fill 0.12s",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={FS.fieldBlock}>
            <label style={FS.fieldLabel}>Title (optional)</label>
            <input
              type="text"
              value={feedbackTitle}
              onChange={(e) => setFeedbackTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              style={FS.input}
            />
          </div>

          <div style={FS.fieldBlock}>
            <label style={FS.fieldLabel}>Comment (optional)</label>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={2000}
              style={FS.textarea}
            />
          </div>

          <div style={FS.formActions}>
            <button
              disabled={feedbackRating === 0 || submittingFeedback}
              onClick={handleSubmitFeedback}
              style={{
              fontFamily: t.serif,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              outline: "none",
              whiteSpace: "nowrap" as const,
            }}>
              Submit Review
            </button>
            <button className=""
              onClick={() => setShowFeedbackForm(false)}
            style={{
              fontFamily: t.serif,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
              outline: "none",
              whiteSpace: "nowrap" as const,
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review list */}
      {localFeedbacks.length > 0 ? (
        <div style={FS.reviewList}>
          {localFeedbacks.map((fb) => (
            <div key={fb.id} style={FS.reviewCard}>
              <div style={FS.reviewCardHeader}>
                <div style={FS.reviewUserRow}>
                  {fb.user.avatar ? (
                    <Image
                      src={fb.user.avatar}
                      alt={fb.user.name}
                      width={28}
                      height={28}
                      style={FS.reviewAvatar}
                    />
                  ) : (
                    <div style={FS.reviewAvatarFallback}>
                      <User
                        style={{
                          width: "13px",
                          height: "13px",
                          color: t.textFaint,
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p style={FS.reviewUserName}>{fb.user.name}</p>
                    <p style={FS.reviewDate}>
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {fb.pending && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "3px",
                        background: t.amberSoft,
                        color: t.amber,
                        border: `1px solid ${t.amberBorder}`,
                      }}
                    >
                      Pending approval
                    </span>
                  )}
                  <div style={FS.reviewStars}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        style={{
                          width: "12px",
                          height: "12px",
                          fill: j < fb.rating ? "#d4a017" : "none",
                          color: j < fb.rating ? "#d4a017" : "#ddd",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {fb.title && <p style={FS.reviewTitle}>{fb.title}</p>}
              {fb.comment && <p style={FS.reviewComment}>{fb.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p style={FS.reviewEmpty}>
          No reviews yet. {canLeave && "Be the first to leave a review!"}
        </p>
      )}
    </div>
  );
}
