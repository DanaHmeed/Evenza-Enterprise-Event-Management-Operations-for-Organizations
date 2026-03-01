// app/(root)/events/[eventId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  User,
} from "lucide-react";
import EvenzaButton from "@/components/shared/button/EvenzaButton";

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
  feedbacks?: FeedbackData[];
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

// ─── Main Component ───
export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration state
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({
    count: 0,
    averageRating: 0,
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        setEvent(data.data || data);
      } catch {
        setError("Event not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  // Handle payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      setActionMessage({
        type: "success",
        text: "Payment successful! Your ticket has been confirmed. Check your email for details.",
      });
      setIsRegistered(true);
      setRegistrationStatus("APPROVED");
      // Clean URL
      window.history.replaceState({}, "", `/events/${eventId}`);
    } else if (payment === "cancelled") {
      setActionMessage({
        type: "error",
        text: "Payment was cancelled. You can try again anytime.",
      });
      window.history.replaceState({}, "", `/events/${eventId}`);
    }
  }, [eventId]);

  // Check if user is already registered
  useEffect(() => {
    if (!isSignedIn || !eventId) return;
    const checkRegistration = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/registration-status`);
        if (res.ok) {
          const data = await res.json();
          if (data.registered) {
            setIsRegistered(true);
            setRegistrationStatus(data.status);
          }
        }
      } catch {
        // Non-critical
      }
    };
    checkRegistration();
  }, [isSignedIn, eventId]);

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/feedback`);
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.data?.feedbacks || []);
          setFeedbackStats(data.data?.stats || { count: 0, averageRating: 0 });
        }
      } catch {
        // Feedback fetch failed — non-critical
      }
    };
    if (eventId) fetchFeedback();
  }, [eventId]);

  // ─── Handlers ───
  const handleRegister = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/events/${eventId}`);
      return;
    }
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
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
        setActionMessage({
          type: "error",
          text: data.error || "Registration failed",
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  };

  const handlePurchase = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/events/${eventId}`);
      return;
    }
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "STRIPE" }),
      });
      const data = await res.json();
      if (res.ok && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Purchase failed",
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setRegistering(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(false);
        setRegistrationStatus(null);
        setActionMessage({
          type: "success",
          text: "Registration cancelled successfully.",
        });
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to cancel",
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) return;
    setSubmittingFeedback(true);
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
        setShowFeedbackForm(false);
        setFeedbackRating(0);
        setFeedbackTitle("");
        setFeedbackComment("");
        setActionMessage({
          type: "success",
          text: "Feedback submitted! It will appear after admin approval.",
        });
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to submit feedback",
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ─── Helpers ───
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setActionMessage({ type: "success", text: "Link copied to clipboard!" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // ─── Loading / Error states ───
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-black-600 font-semibold hover:text-black-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // ─── Derived state ───
  const isPast = new Date(event.endDate) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isFull = event.seatsRemaining <= 0;
  const isCancelled = event.status === "CANCELLED";

  const canRegister =
    !isPast &&
    !isDeadlinePassed &&
    !isFull &&
    !isCancelled &&
    !isRegistered &&
    event.eventType === "FREE";

  const canPurchase =
    !isPast &&
    !isDeadlinePassed &&
    !isFull &&
    !isCancelled &&
    !isRegistered &&
    event.eventType === "PAID";

  const canCancel = isRegistered && !isPast;
  const canLeaveFeedback = isSignedIn && isPast && isRegistered;

  const seatsPercentage =
    event.capacity > 0
      ? ((event.capacity - event.seatsRemaining) / event.capacity) * 100
      : 0;

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back button + share */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link
            href="/events"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Events
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-6 right-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {event.category && (
              <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-semibold">
                {event.category.name}
              </span>
            )}
            {event.eventType === "FREE" ? (
              <span className="px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-semibold">
                Free
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-semibold">
                ${event.price} {event.currency}
              </span>
            )}
            {isPast && (
              <span className="px-3 py-1 rounded-full bg-gray-500/90 text-white text-xs font-semibold">
                Ended
              </span>
            )}
            {isCancelled && (
              <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-semibold">
                Cancelled
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Action message */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              actionMessage.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium">{actionMessage.text}</p>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="ml-auto text-sm opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Organizer */}
            <div className="flex items-center gap-3">
              {event.organizer.avatar ? (
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-black-500" />
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Organized by</p>
                <p className="text-sm font-semibold text-gray-900">
                  {event.organizer.name}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <div className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* ─── Feedback Section ─── */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Reviews & Feedback
                  </h2>
                  {feedbackStats.count > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {feedbackStats.averageRating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({feedbackStats.count} review
                        {feedbackStats.count !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>

                {canLeaveFeedback && !showFeedbackForm && (
                  <EvenzaButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedbackForm(true)}
                  >
                    Write a Review
                  </EvenzaButton>
                )}
              </div>

              {/* Feedback Form */}
              {showFeedbackForm && (
                <form
                  onSubmit={handleSubmitFeedback}
                  className="bg-white border border-gray-200 rounded-2xl p-6 mb-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Your Review
                  </h3>

                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Rating *
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= feedbackRating
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-300 hover:text-orange-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                      maxLength={100}
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Comment (optional)
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 resize-none"
                      maxLength={2000}
                    />
                  </div>

                  <div className="flex gap-3">
                    <EvenzaButton
                      type="submit"
                      size="sm"
                      loading={submittingFeedback}
                      disabled={feedbackRating === 0}
                    >
                      Submit Review
                    </EvenzaButton>
                    <EvenzaButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeedbackForm(false)}
                    >
                      Cancel
                    </EvenzaButton>
                  </div>
                </form>
              )}

              {/* Feedback List */}
              {feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-white border border-gray-100 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {fb.user.avatar ? (
                            <img
                              src={fb.user.avatar}
                              alt={fb.user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {fb.user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={`w-3.5 h-3.5 ${
                                j < fb.rating
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {fb.title && (
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {fb.title}
                        </p>
                      )}
                      {fb.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {fb.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  No reviews yet.{" "}
                  {canLeaveFeedback && "Be the first to leave a review!"}
                </p>
              )}
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-5">
            {/* Registration Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              {/* Date & Time */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                      Event Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(event.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTime(event.startDate)} –{" "}
                      {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {event.isOnline ? (
                    <Globe className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                      {event.isOnline ? "Online" : "Venue"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.isOnline
                        ? "Virtual Event (via Zoom)"
                        : event.venueName ||
                          event.address ||
                          event.city ||
                          "TBA"}
                    </p>
                    {!event.isOnline && event.city && event.venueName && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[event.address, event.city, event.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {event.eventType === "PAID" && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-0.5">
                        Price
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${event.price}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          {event.currency}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Capacity bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {event.capacity - event.seatsRemaining} / {event.capacity}{" "}
                    registered
                  </span>
                  <span>
                    {event.seatsRemaining > 0
                      ? `${event.seatsRemaining} spots left`
                      : "Full"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      seatsPercentage > 90
                        ? "bg-red-500"
                        : seatsPercentage > 70
                          ? "bg-amber-500"
                          : "bg-orange-500"
                    }`}
                    style={{ width: `${Math.min(seatsPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Registration deadline */}
              {!isPast && (
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Registration deadline:{" "}
                  <span className="font-semibold text-gray-700">
                    {formatDate(event.registrationDeadline)}
                  </span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {isRegistered ? (
                  <>
                    <div className="flex items-center gap-2 justify-center py-3 px-4 rounded-xl bg-green-50 border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        {registrationStatus === "PENDING"
                          ? "Registration Pending Approval"
                          : "You're Registered!"}
                      </span>
                    </div>
                    {canCancel && (
                      <EvenzaButton
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleCancelRegistration}
                        loading={registering}
                      >
                        Cancel Registration
                      </EvenzaButton>
                    )}
                  </>
                ) : canRegister ? (
                  <EvenzaButton
                    size="lg"
                    className="w-full"
                    onClick={handleRegister}
                    loading={registering}
                  >
                    <Ticket className="w-4 h-4" />
                    Register for Free
                  </EvenzaButton>
                ) : canPurchase ? (
                  <EvenzaButton
                    size="lg"
                    className="w-full"
                    onClick={handlePurchase}
                    loading={registering}
                  >
                    <CreditCard className="w-4 h-4" />
                    Purchase Ticket — ${event.price}
                  </EvenzaButton>
                ) : isPast ? (
                  <div className="py-3 px-4 rounded-xl bg-gray-100 text-center">
                    <span className="text-sm font-semibold text-gray-500">
                      This event has ended
                    </span>
                  </div>
                ) : isCancelled ? (
                  <div className="py-3 px-4 rounded-xl bg-red-50 text-center border border-red-200">
                    <span className="text-sm font-semibold text-red-600">
                      This event has been cancelled
                    </span>
                  </div>
                ) : isDeadlinePassed ? (
                  <div className="py-3 px-4 rounded-xl bg-gray-100 text-center">
                    <span className="text-sm font-semibold text-gray-500">
                      Registration closed
                    </span>
                  </div>
                ) : isFull ? (
                  <div className="space-y-2">
                    <div className="py-3 px-4 rounded-xl bg-amber-50 text-center border border-amber-200">
                      <span className="text-sm font-semibold text-amber-700">
                        Event is full
                      </span>
                    </div>
                    {event.waitlistEnabled && (
                      <EvenzaButton
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleRegister}
                        loading={registering}
                      >
                        Join Waitlist
                      </EvenzaButton>
                    )}
                  </div>
                ) : null}

                {!isSignedIn && !isPast && !isCancelled && (
                  <p className="text-xs text-gray-400 text-center">
                    <Link
                      href={`/sign-in?redirect_url=/events/${eventId}`}
                      className="text-orange-600 font-semibold hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to register for this event.
                  </p>
                )}
              </div>
            </div>

            {/* Approval notice */}
            {event.approvalRequired && !isRegistered && !isPast && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> This event requires organizer approval.
                  Your registration will be reviewed before confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
