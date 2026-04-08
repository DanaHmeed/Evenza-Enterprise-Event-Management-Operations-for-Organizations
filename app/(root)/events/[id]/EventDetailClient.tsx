// app/(root)/events/[id]/EventDetailClient.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Users,
  Ticket,
  Star,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  User,
} from "lucide-react";
import EvenzaButton from "@/components/shared/button/EvenzaButton";

/* ════════════════════════════════════════════════
   Design tokens
   ════════════════════════════════════════════════ */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.08)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  greenBorder: "rgba(45,106,79,0.15)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.06)",
  amberBorder: "rgba(180,83,9,0.15)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

// ─── Types ───
interface EventData {
  id: string;
  title: string;
  slug?: string;
  description: string;
  summary?: string | null;
  banner?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  startDate: string;
  endDate: string;
  timezone?: string;
  registrationDeadline: string;
  eventType: "FREE" | "PAID";
  price?: number | null;
  currency?: string | null;
  isOnline: boolean;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  meetingLink?: string | null;
  capacity: number;
  seatsRemaining: number;
  waitlistEnabled?: boolean;
  approvalRequired?: boolean;
  status: string;
  viewCount?: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
  tags?: { id: string; name: string; slug: string }[];
  _count: {
    registrations: number;
    feedbacks: number;
  };
}

interface FeedbackData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

interface EventDetailClientProps {
  event: EventData;
  feedbacks: FeedbackData[];
  feedbackStats: { count: number; averageRating: number };
}

// ─── Formatters (outside component - no re-creation) ───
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const fmtShortDate = (s: string) => {
  const d = new Date(s);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

// ─── Main Component ───
export default function EventDetailClient({
  event,
  feedbacks: initialFeedbacks,
  feedbackStats: initialFeedbackStats,
}: EventDetailClientProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();

  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>(initialFeedbacks);
  const [feedbackStats] = useState(initialFeedbackStats);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Track if initial checks have run
  const initialChecksDone = useRef(false);

  // ─── Combined initialization effect ───
  useEffect(() => {
    if (!isClerkLoaded || initialChecksDone.current) return;
    initialChecksDone.current = true;

    // Check URL for payment status
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    
    if (paymentStatus === "success") {
      setActionMessage({
        type: "success",
        text: "Payment successful! Your ticket has been confirmed. Check your email for details.",
      });
      setIsRegistered(true);
      setRegistrationStatus("APPROVED");
      window.history.replaceState({}, "", `/events/${event.id}`);
      return;
    } else if (paymentStatus === "cancelled") {
      setActionMessage({
        type: "error",
        text: "Payment was cancelled. You can try again anytime.",
      });
      window.history.replaceState({}, "", `/events/${event.id}`);
      return;
    }

    // Check registration status in parallel (only if signed in)
    if (isSignedIn) {
      fetch(`/api/events/${event.id}/registration-status`)
        .then((res) => res.ok && res.json())
        .then((data) => {
          if (data?.registered) {
            setIsRegistered(true);
            setRegistrationStatus(data.status);
          }
        })
        .catch(() => {}); // Silent fail
    }
  }, [isClerkLoaded, isSignedIn, event.id]);

  // ─── Handlers ───
  const handleRegister = useCallback(async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/events/${event.id}`);
      return;
    }
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(true);
        setRegistrationStatus(data.data?.registration?.status || "APPROVED");
        setActionMessage({
          type: "success",
          text: data.message || "Registered successfully!",
        });
      } else {
        setActionMessage({ type: "error", text: data.error || "Registration failed" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  }, [isSignedIn, event.id, router]);

  const handlePurchase = useCallback(async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/events/${event.id}`);
      return;
    }
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "STRIPE" }),
      });
      const data = await res.json();
      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        setActionMessage({ type: "error", text: data.error || "Purchase failed" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  }, [isSignedIn, event.id, router]);

  const handleCancelRegistration = useCallback(async () => {
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(false);
        setRegistrationStatus(null);
        setActionMessage({ type: "success", text: "Registration cancelled successfully." });
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to cancel" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  }, [event.id]);

  const handleSubmitFeedback = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (feedbackRating === 0) return;
      setSubmittingFeedback(true);
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            rating: feedbackRating,
            title: feedbackTitle || undefined,
            comment: feedbackComment || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setShowFeedbackForm(false);
          setFeedbackRating(0);
          setFeedbackTitle("");
          setFeedbackComment("");
          setActionMessage({
            type: "success",
            text: "Feedback submitted! It will appear after admin approval.",
          });
        } else {
          setActionMessage({ type: "error", text: data.error || "Failed to submit feedback" });
        }
      } catch {
        setActionMessage({ type: "error", text: "Something went wrong" });
      } finally {
        setSubmittingFeedback(false);
      }
    },
    [event.id, feedbackRating, feedbackTitle, feedbackComment]
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setActionMessage({ type: "success", text: "Link copied to clipboard!" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // ─── Derived state (computed once) ───
  const isPast = new Date(event.endDate) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isFull = event.seatsRemaining <= 0;
  const isCancelled = event.status === "CANCELLED";
  const canRegister =
    !isPast && !isDeadlinePassed && !isFull && !isCancelled && !isRegistered && event.eventType === "FREE";
  const canPurchase =
    !isPast && !isDeadlinePassed && !isFull && !isCancelled && !isRegistered && event.eventType === "PAID";
  const canCancel = isRegistered && !isPast;
  const canLeaveFeedback = isSignedIn && isPast && isRegistered;
  const seatsPercentage =
    event.capacity > 0
      ? ((event.capacity - event.seatsRemaining) / event.capacity) * 100
      : 0;

  const startInfo = fmtShortDate(event.startDate);
  const locationLabel = event.isOnline
    ? "Virtual Event (Online)"
    : event.venueName || event.address || event.city || "TBA";
  const locationDetail =
    !event.isOnline && event.city && event.venueName
      ? [event.address, event.city, event.country].filter(Boolean).join(", ")
      : null;

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {/* ════════════════════════════════════════
          BANNER
          ════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "21 / 8",
          maxHeight: "420px",
          minHeight: "260px",
          overflow: "hidden",
          background: "#1a1a2e",
        }}
      >
        {event.banner ? (
          <Image
            src={event.banner}
            alt={event.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            style={{ opacity: 0.5, filter: "blur(5px)" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "32px",
            right: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "4px",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            All Events
          </Link>
          <button
            onClick={handleShare}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Share2 style={{ width: "14px", height: "14px" }} />
            Share
          </button>
        </div>

        {/* Title block on banner */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "32px",
            right: "32px",
            maxWidth: "800px",
          }}
        >
          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
            {event.category && (
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: t.accent,
                  borderRadius: "3px",
                }}
              >
                {event.category.name}
              </span>
            )}
            {event.eventType === "FREE" ? (
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: t.green,
                  borderRadius: "3px",
                }}
              >
                Free
              </span>
            ) : (
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "3px",
                }}
              >
                ${event.price} {event.currency}
              </span>
            )}
            {isPast && (
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                }}
              >
                Ended
              </span>
            )}
            {isCancelled && (
              <span
                style={{
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "rgba(220,53,69,0.85)",
                  borderRadius: "3px",
                }}
              >
                Cancelled
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: t.serif,
              fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)",
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {event.title}
          </h1>
        </div>
      </div>

      {/* ════════════════════════════════════════
          CONTENT
          ════════════════════════════════════════ */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "48px 48px 96px",
        }}
      >
        {/* Action message */}
        {actionMessage && (
          <div
            style={{
              marginBottom: "32px",
              padding: "14px 18px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              fontSize: "13px",
              fontWeight: 500,
              background:
                actionMessage.type === "success" ? t.greenSoft : "rgba(220,53,69,0.06)",
              border: `1px solid ${
                actionMessage.type === "success" ? t.greenBorder : "rgba(220,53,69,0.15)"
              }`,
              color: actionMessage.type === "success" ? t.green : t.accent,
            }}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" }} />
            ) : (
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" }} />
            )}
            <span style={{ flex: 1 }}>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                opacity: 0.5,
                color: "inherit",
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "56px",
            alignItems: "start",
          }}
          className="lg:grid-cols-[1fr_380px] grid-cols-1"
        >
          {/* ── Left: Main Content ── */}
          <div>
            {/* Organizer row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "40px",
                paddingBottom: "24px",
                borderBottom: `1px solid ${t.borderLight}`,
              }}
            >
              {event.organizer.avatar ? (
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: t.borderLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User style={{ width: "16px", height: "16px", color: t.textFaint }} />
                </div>
              )}
              <div>
                <p style={{ fontSize: "11px", color: t.textFaint, margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Organized by
                </p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>
                  {event.organizer.name}
                </p>
              </div>
            </div>

            {/* Quick info strip */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "32px",
                marginBottom: "40px",
              }}
            >
              {/* Date chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 14px",
                    background: t.accentSoft,
                    borderRadius: "4px",
                    minWidth: "52px",
                  }}
                >
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: t.accent, lineHeight: 1 }}>
                    {startInfo.month}
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: t.text, fontFamily: t.serif, lineHeight: 1.2 }}>
                    {startInfo.day}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>
                    {fmtDate(event.startDate)}
                  </p>
                  <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>
                    {fmtTime(event.startDate)} – {fmtTime(event.endDate)}
                  </p>
                </div>
              </div>

              {/* Location chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.borderLight,
                    borderRadius: "4px",
                  }}
                >
                  {event.isOnline ? (
                    <Globe style={{ width: "18px", height: "18px", color: t.textFaint }} />
                  ) : (
                    <MapPin style={{ width: "18px", height: "18px", color: t.textFaint }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>
                    {locationLabel}
                  </p>
                  {locationDetail && (
                    <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>
                      {locationDetail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Description ── */}
            <div style={{ marginBottom: "48px" }}>
              <h2
                style={{
                  fontFamily: t.serif,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: t.text,
                  margin: "0 0 20px 0",
                }}
              >
                About This Event
              </h2>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.75,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {event.description}
              </div>
            </div>

            {/* ── Tags ── */}
            {event.tags && event.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "48px" }}>
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#666",
                      background: t.borderLight,
                      borderRadius: "3px",
                    }}
                  >
                    <Tag style={{ width: "11px", height: "11px" }} />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* ════════════════════════════════════
                FEEDBACK SECTION
                ════════════════════════════════════ */}
            <div style={{ borderTop: `1px solid ${t.borderLight}`, paddingTop: "40px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <h2 style={{ fontFamily: t.serif, fontSize: "20px", fontWeight: 600, color: t.text, margin: 0 }}>
                    Reviews
                  </h2>
                  {feedbackStats.count > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star style={{ width: "14px", height: "14px", fill: "#d4a017", color: "#d4a017" }} />
                        <span style={{ fontSize: "14px", fontWeight: 600, color: t.text }}>
                          {feedbackStats.averageRating}
                        </span>
                      </div>
                      <span style={{ fontSize: "13px", color: t.textMuted }}>
                        ({feedbackStats.count} review{feedbackStats.count !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>

                {canLeaveFeedback && !showFeedbackForm && (
                  <EvenzaButton variant="outline" size="sm" onClick={() => setShowFeedbackForm(true)}>
                    Write a Review
                  </EvenzaButton>
                )}
              </div>

              {/* Feedback Form */}
              {showFeedbackForm && (
                <div
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: "6px",
                    padding: "28px",
                    marginBottom: "28px",
                  }}
                >
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: t.text, margin: "0 0 20px 0" }}>
                    Your Review
                  </h3>

                  {/* Stars */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Rating *
                    </label>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                        >
                          <Star
                            style={{
                              width: "24px",
                              height: "24px",
                              fill: star <= feedbackRating ? "#d4a017" : "none",
                              color: star <= feedbackRating ? "#d4a017" : "#ccc",
                              transition: "color 0.15s, fill 0.15s",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      maxLength={100}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: `1px solid ${t.border}`,
                        borderRadius: "4px",
                        outline: "none",
                        fontFamily: t.sans,
                        color: t.text,
                        background: t.bg,
                      }}
                    />
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Comment (optional)
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      maxLength={2000}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: `1px solid ${t.border}`,
                        borderRadius: "4px",
                        outline: "none",
                        fontFamily: t.sans,
                        color: t.text,
                        background: t.bg,
                        resize: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <EvenzaButton type="submit" size="sm" loading={submittingFeedback} disabled={feedbackRating === 0} onClick={handleSubmitFeedback}>
                      Submit Review
                    </EvenzaButton>
                    <EvenzaButton type="button" variant="ghost" size="sm" onClick={() => setShowFeedbackForm(false)}>
                      Cancel
                    </EvenzaButton>
                  </div>
                </div>
              )}

              {/* Feedback List */}
              {feedbacks.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      style={{
                        background: t.surface,
                        border: `1px solid ${t.borderLight}`,
                        borderRadius: "6px",
                        padding: "20px 24px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {fb.user.avatar ? (
                            <img
                              src={fb.user.avatar}
                              alt={fb.user.name}
                              style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: t.borderLight,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <User style={{ width: "13px", height: "13px", color: t.textFaint }} />
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 }}>
                              {fb.user.name}
                            </p>
                            <p style={{ fontSize: "11px", color: t.textFaint, margin: 0 }}>
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
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
                      {fb.title && (
                        <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: "0 0 4px 0" }}>
                          {fb.title}
                        </p>
                      )}
                      {fb.comment && (
                        <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                          {fb.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: t.textFaint, textAlign: "center", padding: "48px 0" }}>
                  No reviews yet. {canLeaveFeedback && "Be the first to leave a review!"}
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="hidden lg:block">
            <div style={{ position: "sticky", top: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Registration card */}
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "6px", padding: "28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
                  <SidebarRow icon={<Calendar style={{ width: "16px", height: "16px", color: t.textFaint }} />} label="Date" value={fmtDate(event.startDate)} />
                  <SidebarRow icon={<Clock style={{ width: "16px", height: "16px", color: t.textFaint }} />} label="Time" value={`${fmtTime(event.startDate)} – ${fmtTime(event.endDate)}`} />
                  <SidebarRow
                    icon={event.isOnline ? <Globe style={{ width: "16px", height: "16px", color: t.textFaint }} /> : <MapPin style={{ width: "16px", height: "16px", color: t.textFaint }} />}
                    label={event.isOnline ? "Online" : "Venue"}
                    value={locationLabel}
                  />
                  {event.eventType === "PAID" && (
                    <SidebarRow
                      icon={<CreditCard style={{ width: "16px", height: "16px", color: t.textFaint }} />}
                      label="Price"
                      value={`$${event.price} ${event.currency || ""}`}
                      valueStyle={{ fontSize: "17px", fontWeight: 700, fontFamily: t.serif }}
                    />
                  )}
                </div>

                {/* Capacity bar */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: t.textMuted, marginBottom: "6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users style={{ width: "12px", height: "12px" }} />
                      {event.capacity - event.seatsRemaining} / {event.capacity}
                    </span>
                    <span>{event.seatsRemaining > 0 ? `${event.seatsRemaining} spots left` : "Full"}</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: t.borderLight, borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "2px",
                        width: `${Math.min(seatsPercentage, 100)}%`,
                        background: seatsPercentage > 90 ? t.accent : seatsPercentage > 70 ? t.amber : t.green,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                {!isPast && (
                  <p style={{ fontSize: "11px", color: t.textFaint, textAlign: "center", marginBottom: "20px" }}>
                    Registration closes{" "}
                    <span style={{ fontWeight: 600, color: "#666" }}>{fmtDate(event.registrationDeadline)}</span>
                  </p>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {canRegister ? (
                    <EvenzaButton size="lg" className="w-full" onClick={handleRegister} loading={registering}>
                      <Ticket style={{ width: "15px", height: "15px" }} />
                      Register for Free
                    </EvenzaButton>
                  ) : canPurchase ? (
                    <EvenzaButton size="lg" className="w-full" onClick={handlePurchase} loading={registering}>
                      <CreditCard style={{ width: "15px", height: "15px" }} />
                      Purchase Ticket — ${event.price}
                    </EvenzaButton>
                  ) : isRegistered ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "13px",
                          borderRadius: "4px",
                          background: t.greenSoft,
                          border: `1px solid ${t.greenBorder}`,
                        }}
                      >
                        <CheckCircle2 style={{ width: "15px", height: "15px", color: t.green }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: t.green }}>
                          {registrationStatus === "PENDING" ? "Pending Approval" : "You\u2019re Registered"}
                        </span>
                      </div>
                      {canCancel && (
                        <EvenzaButton variant="secondary" size="sm" className="w-full" onClick={handleCancelRegistration} loading={registering}>
                          Cancel Registration
                        </EvenzaButton>
                      )}
                    </>
                  ) : isPast ? (
                    <StatusBox text="This event has ended" bg={t.borderLight} color={t.textMuted} />
                  ) : isCancelled ? (
                    <StatusBox text="This event has been cancelled" bg="rgba(230,57,70,0.06)" color={t.accent} border="rgba(230,57,70,0.15)" />
                  ) : isDeadlinePassed ? (
                    <StatusBox text="Registration closed" bg={t.borderLight} color={t.textMuted} />
                  ) : isFull ? (
                    <>
                      <StatusBox text="Event is full" bg={t.amberSoft} color={t.amber} border={t.amberBorder} />
                      {event.waitlistEnabled && (
                        <EvenzaButton variant="outline" size="sm" className="w-full" onClick={handleRegister} loading={registering}>
                          Join Waitlist
                        </EvenzaButton>
                      )}
                    </>
                  ) : null}

                  {!isSignedIn && !isPast && !isCancelled && (
                    <p style={{ fontSize: "12px", color: t.textFaint, textAlign: "center", margin: "4px 0 0" }}>
                      <Link href={`/sign-in?redirect_url=/events/${event.id}`} style={{ color: t.accent, fontWeight: 600, textDecoration: "none" }}>
                        Sign in
                      </Link>{" "}
                      to register for this event.
                    </p>
                  )}
                </div>
              </div>

              {/* Approval notice */}
              {event.approvalRequired && !isRegistered && !isPast && (
                <div style={{ background: t.amberSoft, border: `1px solid ${t.amberBorder}`, borderRadius: "6px", padding: "16px 20px" }}>
                  <p style={{ fontSize: "12px", color: t.amber, margin: 0, lineHeight: 1.5 }}>
                    <strong>Note:</strong> This event requires organizer approval. Your registration will be reviewed before confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile sidebar ── */}
          <div className="lg:hidden" style={{ gridColumn: "1 / -1" }}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "6px", padding: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
                <SidebarRow icon={<Calendar style={{ width: "16px", height: "16px", color: t.textFaint }} />} label="Date" value={fmtDate(event.startDate)} />
                <SidebarRow icon={<Clock style={{ width: "16px", height: "16px", color: t.textFaint }} />} label="Time" value={`${fmtTime(event.startDate)} – ${fmtTime(event.endDate)}`} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {canRegister ? (
                  <EvenzaButton size="lg" className="w-full" onClick={handleRegister} loading={registering}>
                    <Ticket style={{ width: "15px", height: "15px" }} />
                    Register for Free
                  </EvenzaButton>
                ) : canPurchase ? (
                  <EvenzaButton size="lg" className="w-full" onClick={handlePurchase} loading={registering}>
                    <CreditCard style={{ width: "15px", height: "15px" }} />
                    Purchase Ticket — ${event.price}
                  </EvenzaButton>
                ) : isRegistered ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "4px", background: t.greenSoft, border: `1px solid ${t.greenBorder}` }}>
                      <CheckCircle2 style={{ width: "15px", height: "15px", color: t.green }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: t.green }}>
                        {registrationStatus === "PENDING" ? "Pending Approval" : "You\u2019re Registered"}
                      </span>
                    </div>
                    {canCancel && (
                      <EvenzaButton variant="secondary" size="sm" className="w-full" onClick={handleCancelRegistration} loading={registering}>
                        Cancel Registration
                      </EvenzaButton>
                    )}
                  </>
                ) : (
                  <StatusBox text={isPast ? "This event has ended" : "Registration closed"} bg={t.borderLight} color={t.textMuted} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function SidebarRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
      <div style={{ marginTop: "2px", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, margin: "0 0 2px 0" }}>
          {label}
        </p>
        <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, ...valueStyle }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBox({ text, bg, color, border }: { text: string; bg: string; color: string; border?: string }) {
  return (
    <div style={{ padding: "12px", borderRadius: "4px", textAlign: "center", background: bg, border: border ? `1px solid ${border}` : "none" }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color }}>{text}</span>
    </div>
  );
}