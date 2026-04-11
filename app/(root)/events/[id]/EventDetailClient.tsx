//app/(root)/events/[id]/EventDetailClient.tsx
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
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  User,
} from "lucide-react";
import { FeedbackSection } from "./feedback/page";

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

/* ════════════════════════════════════════════════
   Module-level style constants
   (zero GC pressure — never re-allocated on render)
   ════════════════════════════════════════════════ */
const S = {
  /* layout */
  page: { background: t.bg, fontFamily: t.sans, minHeight: "100vh" } as React.CSSProperties,
  banner: {
    position: "relative", width: "100%", aspectRatio: "21 / 8",
    maxHeight: "420px", minHeight: "260px", overflow: "hidden", background: "#1a1a2e",
  } as React.CSSProperties,
  bannerFallback: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  } as React.CSSProperties,
  bannerGradient: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
  } as React.CSSProperties,
  bannerTopBar: {
    position: "absolute", top: "24px", left: "32px", right: "32px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  } as React.CSSProperties,
  bannerTitleBlock: {
    position: "absolute", bottom: "32px", left: "32px", right: "32px", maxWidth: "800px",
  } as React.CSSProperties,

  /* banner nav buttons */
  bannerNavLink: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    padding: "7px 15px", fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.03em", color: "rgba(255,255,255,0.92)",
    background: "rgba(0,0,0,0.42)", backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)", borderRadius: "5px",
    textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)",
    transition: "background 0.18s, border-color 0.18s",
  } as React.CSSProperties,
  bannerNavBtn: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    padding: "7px 15px", fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.03em", color: "rgba(255,255,255,0.92)",
    background: "rgba(0,0,0,0.42)", backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)", borderRadius: "5px",
    border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
    transition: "background 0.18s", fontFamily: t.sans,
  } as React.CSSProperties,

  /* badges */
  badgeRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" } as React.CSSProperties,
  badgeAccent: {
    padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#fff", background: t.accent, borderRadius: "3px",
  } as React.CSSProperties,
  badgeFree: {
    padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#fff", background: t.green, borderRadius: "3px",
  } as React.CSSProperties,
  badgePaid: {
    padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.18)", borderRadius: "3px",
  } as React.CSSProperties,
  badgeEnded: {
    padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", borderRadius: "3px",
  } as React.CSSProperties,
  badgeCancelled: {
    padding: "4px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#fff", background: "rgba(220,53,69,0.85)", borderRadius: "3px",
  } as React.CSSProperties,

  /* content area */
  contentWrap: { maxWidth: "1200px", margin: "0 auto", padding: "48px 48px 96px" } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "56px", alignItems: "start" } as React.CSSProperties,

  /* alert */
  alertSuccess: {
    marginBottom: "32px", padding: "14px 18px", borderRadius: "5px",
    display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "13px", fontWeight: 500,
    background: t.greenSoft, border: `1px solid ${t.greenBorder}`, color: t.green,
  } as React.CSSProperties,
  alertError: {
    marginBottom: "32px", padding: "14px 18px", borderRadius: "5px",
    display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "13px", fontWeight: 500,
    background: "rgba(220,53,69,0.06)", border: "1px solid rgba(220,53,69,0.15)", color: t.accent,
  } as React.CSSProperties,
  alertDismiss: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: "16px", opacity: 0.45, color: "inherit", padding: "0", lineHeight: 1,
    flexShrink: 0,
  } as React.CSSProperties,
  alertIcon: { width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" } as React.CSSProperties,

  /* organizer row */
  organizerRow: {
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "40px", paddingBottom: "24px", borderBottom: `1px solid ${t.borderLight}`,
  } as React.CSSProperties,
  organizerAvatar: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" as const },
  organizerAvatarFallback: {
    width: "36px", height: "36px", borderRadius: "50%", background: t.borderLight,
    display: "flex", alignItems: "center", justifyContent: "center",
  } as React.CSSProperties,
  organizerLabel: {
    fontSize: "11px", color: t.textFaint, margin: 0,
    letterSpacing: "0.05em", textTransform: "uppercase" as const,
  } as React.CSSProperties,
  organizerName: { fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 } as React.CSSProperties,

  /* info strip */
  infoStrip: { display: "flex", flexWrap: "wrap", gap: "32px", marginBottom: "40px" } as React.CSSProperties,
  infoChip: { display: "flex", alignItems: "center", gap: "12px" } as React.CSSProperties,
  dateBox: {
    display: "flex", flexDirection: "column" as const, alignItems: "center",
    padding: "8px 14px", background: t.accentSoft, borderRadius: "4px", minWidth: "52px",
  } as React.CSSProperties,
  dateMonth: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: t.accent, lineHeight: 1 } as React.CSSProperties,
  dateDay: { fontSize: "20px", fontWeight: 700, color: t.text, fontFamily: t.serif, lineHeight: 1.2 } as React.CSSProperties,
  locationBox: {
    width: "44px", height: "44px", display: "flex", alignItems: "center",
    justifyContent: "center", background: t.borderLight, borderRadius: "4px",
  } as React.CSSProperties,
  infoLabel: { fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 } as React.CSSProperties,
  infoSub: { fontSize: "12px", color: t.textMuted, margin: "2px 0 0" } as React.CSSProperties,

  /* sections */
  sectionTitle: {
    fontFamily: t.serif, fontSize: "20px", fontWeight: 600,
    color: t.text, margin: "0 0 20px 0",
  } as React.CSSProperties,
  descriptionText: { fontSize: "14px", lineHeight: 1.75, color: "#555", whiteSpace: "pre-wrap" as const } as React.CSSProperties,
  descriptionBlock: { marginBottom: "48px" } as React.CSSProperties,
  tagsRow: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "48px" } as React.CSSProperties,
  tag: {
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "5px 12px", fontSize: "12px", fontWeight: 500,
    color: "#666", background: t.borderLight, borderRadius: "3px",
    border: "1px solid transparent",
  } as React.CSSProperties,

  /* reviews */
  reviewsSection: { borderTop: `1px solid ${t.borderLight}`, paddingTop: "40px" } as React.CSSProperties,
  reviewsHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" } as React.CSSProperties,
  reviewsTitleGroup: { display: "inline-block" } as React.CSSProperties,
  reviewsTitle: { fontFamily: t.serif, fontSize: "20px", fontWeight: 600, color: t.text, margin: 0 } as React.CSSProperties,
  reviewsStats: { display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" } as React.CSSProperties,
  reviewsStarRow: { display: "flex", alignItems: "center", gap: "4px" } as React.CSSProperties,
  reviewsAvg: { fontSize: "14px", fontWeight: 600, color: t.text } as React.CSSProperties,
  reviewsCount: { fontSize: "13px", color: t.textMuted } as React.CSSProperties,
  reviewEmpty: { fontSize: "13px", color: t.textFaint, textAlign: "center" as const, padding: "48px 0" } as React.CSSProperties,
  reviewList: { display: "flex", flexDirection: "column" as const, gap: "16px" } as React.CSSProperties,

  /* feedback form */
  feedbackCard: {
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: "8px", padding: "28px", marginBottom: "28px",
  } as React.CSSProperties,
  feedbackFormTitle: { fontSize: "15px", fontWeight: 600, color: t.text, margin: "0 0 24px 0" } as React.CSSProperties,
  fieldLabel: {
    display: "block", fontSize: "11px", fontWeight: 700, color: "#777",
    marginBottom: "8px", textTransform: "uppercase" as const, letterSpacing: "0.07em",
  } as React.CSSProperties,
  fieldBlock: { marginBottom: "20px" } as React.CSSProperties,
  starsRow: { display: "flex", gap: "6px", marginTop: "2px" } as React.CSSProperties,
  starBtn: {
    background: "none", border: "none", cursor: "pointer", padding: "4px",
    borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.12s",
  } as React.CSSProperties,
  input: {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    border: `1px solid ${t.border}`, borderRadius: "5px",
    outline: "none", fontFamily: t.sans, color: t.text, background: t.bg,
    boxSizing: "border-box" as const, transition: "border-color 0.15s",
  } as React.CSSProperties,
  textarea: {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    border: `1px solid ${t.border}`, borderRadius: "5px",
    outline: "none", fontFamily: t.sans, color: t.text, background: t.bg,
    resize: "none" as const, boxSizing: "border-box" as const, transition: "border-color 0.15s",
  } as React.CSSProperties,
  formActions: { display: "flex", gap: "12px" } as React.CSSProperties,

  /* review card */
  reviewCard: {
    background: t.surface, border: `1px solid ${t.borderLight}`,
    borderRadius: "8px", padding: "20px 24px",
  } as React.CSSProperties,
  reviewCardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" } as React.CSSProperties,
  reviewUserRow: { display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties,
  reviewAvatar: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" as const },
  reviewAvatarFallback: {
    width: "28px", height: "28px", borderRadius: "50%", background: t.borderLight,
    display: "flex", alignItems: "center", justifyContent: "center",
  } as React.CSSProperties,
  reviewUserName: { fontSize: "13px", fontWeight: 600, color: t.text, margin: 0 } as React.CSSProperties,
  reviewDate: { fontSize: "11px", color: t.textFaint, margin: 0 } as React.CSSProperties,
  reviewStars: { display: "flex", gap: "2px" } as React.CSSProperties,
  reviewTitle: { fontSize: "14px", fontWeight: 600, color: t.text, margin: "0 0 5px 0" } as React.CSSProperties,
  reviewComment: { fontSize: "13px", color: "#666", lineHeight: 1.65, margin: 0 } as React.CSSProperties,

  /* sidebar */
  sidebarSticky: { position: "sticky" as const, top: "32px", display: "flex", flexDirection: "column" as const, gap: "20px" } as React.CSSProperties,
  sidebarCard: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "28px" } as React.CSSProperties,
  sidebarRows: { display: "flex", flexDirection: "column" as const, gap: "18px", marginBottom: "24px" } as React.CSSProperties,
  capacityBlock: { marginBottom: "24px" } as React.CSSProperties,
  capacityRow: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: t.textMuted, marginBottom: "6px" } as React.CSSProperties,
  capacityBarWrap: { width: "100%", height: "4px", background: t.borderLight, borderRadius: "2px", overflow: "hidden" } as React.CSSProperties,
  deadlineText: { fontSize: "11px", color: t.textFaint, textAlign: "center" as const, marginBottom: "20px" } as React.CSSProperties,
  deadlineSpan: { fontWeight: 600, color: "#666" } as React.CSSProperties,
  actionBtns: { display: "flex", flexDirection: "column" as const, gap: "8px" } as React.CSSProperties,
  registeredBadge: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    padding: "13px", borderRadius: "999px",
    background: t.greenSoft, border: `1px solid ${t.greenBorder}`,
  } as React.CSSProperties,
  registeredText: { fontSize: "13px", fontWeight: 600, color: t.green } as React.CSSProperties,
  approvalNotice: {
    background: t.amberSoft, border: `1px solid ${t.amberBorder}`,
    borderRadius: "8px", padding: "16px 20px",
  } as React.CSSProperties,
  approvalText: { fontSize: "12px", color: t.amber, margin: 0, lineHeight: 1.55 } as React.CSSProperties,

  /* icon sizes */
  icon14: { width: "14px", height: "14px" } as React.CSSProperties,
  icon15: { width: "15px", height: "15px" } as React.CSSProperties,
  icon16: { width: "16px", height: "16px", flexShrink: 0 as unknown as number } as React.CSSProperties,
  icon16Faint: { width: "16px", height: "16px", color: t.textFaint } as React.CSSProperties,
  icon18Faint: { width: "18px", height: "18px", color: t.textFaint } as React.CSSProperties,
  icon12: { width: "12px", height: "12px" } as React.CSSProperties,
  icon13Faint: { width: "13px", height: "13px", color: t.textFaint } as React.CSSProperties,
  icon11: { width: "11px", height: "11px" } as React.CSSProperties,
  iconFallback16: { width: "16px", height: "16px", color: t.textFaint } as React.CSSProperties,

  /* action buttons */
  btnPrimary: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    width: "100%", padding: "12px 20px", fontSize: "14px", fontWeight: 600,
    color: "#fff", background: t.accent, border: "none", borderRadius: "6px",
    cursor: "pointer", fontFamily: t.sans, transition: "opacity 0.15s",
  } as React.CSSProperties,
  btnSecondary: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    width: "100%", padding: "9px 16px", fontSize: "13px", fontWeight: 600,
    color: t.text, background: t.borderLight, border: `1px solid ${t.border}`,
    borderRadius: "6px", cursor: "pointer", fontFamily: t.sans, transition: "opacity 0.15s",
  } as React.CSSProperties,
  btnOutline: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    width: "100%", padding: "9px 16px", fontSize: "13px", fontWeight: 600,
    color: t.accent, background: t.accentSoft, border: `1px solid rgba(230,57,70,0.2)`,
    borderRadius: "6px", cursor: "pointer", fontFamily: t.sans, transition: "opacity 0.15s",
  } as React.CSSProperties,
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
  organizer: { id: string; name: string; avatar?: string | null };
  category?: { id: string; name: string; slug: string; color?: string | null } | null;
  tags?: { id: string; name: string; slug: string }[];
  _count: { registrations: number; feedbacks: number };
}

interface FeedbackData {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  pending?: boolean;
  user: { id: string; name: string; avatar?: string | null };
}

interface EventDetailClientProps {
  event: EventData;
  feedbacks: FeedbackData[];
  feedbackStats: { count: number; averageRating: number };
}

// ─── Formatters (outside component) ───
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const fmtShortDate = (s: string) => {
  const d = new Date(s);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
  };
};

// ─── Main Component ───
export default function EventDetailClient({
  event,
  feedbacks,
  feedbackStats,
}: EventDetailClientProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded: isClerkLoaded, user } = useUser();

  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initialChecksDone = useRef(false);

  // ─── Payment return & registration check ───
  useEffect(() => {
    const url = new URL(window.location.href);
    const paymentStatus = url.searchParams.get("payment_status");
    if (paymentStatus === "success") {
      setActionMessage({ type: "success", text: "Payment successful! Your ticket has been confirmed. Check your email for details." });
      setIsRegistered(true);
      setRegistrationStatus("APPROVED");
    } else if (paymentStatus === "cancelled") {
      setActionMessage({ type: "error", text: "Payment was cancelled. You can try again anytime." });
    }
    if (paymentStatus) {
      url.searchParams.delete("payment_status");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || initialChecksDone.current) return;
    initialChecksDone.current = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/events/${event.id}/registration-status`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.registered) { setIsRegistered(true); setRegistrationStatus(data.status); }
      } catch { /* silent */ }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [isClerkLoaded, isSignedIn, event.id]);

  // ─── Handlers ───
  const handleRegister = useCallback(async () => {
    if (!isSignedIn) { router.push(`/sign-in?redirect_url=/events/${event.id}`); return; }
    setRegistering(true); setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(true);
        setRegistrationStatus(data.data?.registration?.status || "APPROVED");
        setActionMessage({ type: "success", text: data.message || "Registered successfully!" });
      } else {
        setActionMessage({ type: "error", text: data.error || "Registration failed" });
      }
    } catch { setActionMessage({ type: "error", text: "Something went wrong" }); }
    finally { setRegistering(false); }
  }, [isSignedIn, event.id, router]);

  const handlePurchase = useCallback(async () => {
    if (!isSignedIn) { router.push(`/sign-in?redirect_url=/events/${event.id}`); return; }
    setRegistering(true); setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/purchase`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "STRIPE" }),
      });
      const data = await res.json();
      if (res.ok && data.sessionUrl) { window.location.href = data.sessionUrl; }
      else { setActionMessage({ type: "error", text: data.error || "Purchase failed" }); }
    } catch { setActionMessage({ type: "error", text: "Something went wrong" }); }
    finally { setRegistering(false); }
  }, [isSignedIn, event.id, router]);

  const handleCancelRegistration = useCallback(async () => {
    setRegistering(true); setActionMessage(null);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setIsRegistered(false); setRegistrationStatus(null);
        setActionMessage({ type: "success", text: "Registration cancelled successfully." });
      } else { setActionMessage({ type: "error", text: data.error || "Failed to cancel" }); }
    } catch { setActionMessage({ type: "error", text: "Something went wrong" }); }
    finally { setRegistering(false); }
  }, [event.id]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: event.title, url }); }
    else {
      await navigator.clipboard.writeText(url);
      setActionMessage({ type: "success", text: "Link copied to clipboard!" });
      setTimeout(() => setActionMessage(null), 3000);
    }
  }, [event.title]);

  // ─── Derived state ───
  const isPast = new Date(event.endDate) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isFull = event.seatsRemaining <= 0;
  const isCancelled = event.status === "CANCELLED";
  const canRegister = !isPast && !isDeadlinePassed && !isFull && !isCancelled && !isRegistered && event.eventType === "FREE";
  const canPurchase = !isPast && !isDeadlinePassed && !isFull && !isCancelled && !isRegistered && event.eventType === "PAID";
  const canCancel = isRegistered && !isPast;
  const canLeaveFeedback = isSignedIn && isRegistered;
  const seatsPercentage = event.capacity > 0 ? ((event.capacity - event.seatsRemaining) / event.capacity) * 100 : 0;
  const startInfo = fmtShortDate(event.startDate);
  const locationLabel = event.isOnline ? "Virtual Event (Online)" : event.venueName || event.address || event.city || "TBA";
  const locationDetail = !event.isOnline && event.city && event.venueName
    ? [event.address, event.city, event.country].filter(Boolean).join(", ") : null;
  const barColor = seatsPercentage > 90 ? t.accent : seatsPercentage > 70 ? t.amber : t.green;

  return (
    <div style={S.page}>
      {/* ── BANNER ── */}
      <div style={S.banner}>
        {event.banner ? (
          <Image src={event.banner} alt={event.title} fill priority quality={75}
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover"
            style={{ opacity: 0.5, transform: "scale(1.04)" }}
          />
        ) : (
          <div style={S.bannerFallback} />
        )}
        <div style={S.bannerGradient} />

        {/* Top bar */}
        <div style={S.bannerTopBar}>
          <Link href="/events" style={S.bannerNavLink}>
            <ArrowLeft style={S.icon14} />
            All Events
          </Link>
          <button onClick={handleShare} style={S.bannerNavBtn}>
            <Share2 style={S.icon14} />
            Share
          </button>
        </div>

        {/* Title block */}
        <div style={S.bannerTitleBlock}>
          <div style={S.badgeRow}>
            {event.category && <span style={S.badgeAccent}>{event.category.name}</span>}
            {event.eventType === "FREE"
              ? <span style={S.badgeFree}>Free</span>
              : <span style={S.badgePaid}>${event.price} {event.currency}</span>
            }
            {isPast && <span style={S.badgeEnded}>Ended</span>}
            {isCancelled && <span style={S.badgeCancelled}>Cancelled</span>}
          </div>
          <h1 style={{
            fontFamily: t.serif, fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)",
            fontWeight: 600, color: "#fff", lineHeight: 1.2,
            letterSpacing: "-0.02em", margin: 0,
          }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={S.contentWrap}>
        {/* Alert */}
        {actionMessage && (
          <div style={actionMessage.type === "success" ? S.alertSuccess : S.alertError}>
            {actionMessage.type === "success"
              ? <CheckCircle2 style={S.alertIcon} />
              : <AlertCircle style={S.alertIcon} />
            }
            <span style={{ flex: 1 }}>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} style={S.alertDismiss}>×</button>
          </div>
        )}

        <div style={S.grid} className="lg:grid-cols-[1fr_380px] grid-cols-1">
          {/* ── LEFT ── */}
          <div>
            {/* Organizer */}
            <div style={S.organizerRow}>
              {event.organizer.avatar
                ? <img src={event.organizer.avatar} alt={event.organizer.name} style={S.organizerAvatar} />
                : <div style={S.organizerAvatarFallback}><User style={S.iconFallback16} /></div>
              }
              <div>
                <p style={S.organizerLabel}>Organized by</p>
                <p style={S.organizerName}>{event.organizer.name}</p>
              </div>
            </div>

            {/* Info strip */}
            <div style={S.infoStrip}>
              <div style={S.infoChip}>
                <div style={S.dateBox}>
                  <span style={S.dateMonth}>{startInfo.month}</span>
                  <span style={S.dateDay}>{startInfo.day}</span>
                </div>
                <div>
                  <p style={S.infoLabel}>{fmtDate(event.startDate)}</p>
                  <p style={S.infoSub}>{fmtTime(event.startDate)} – {fmtTime(event.endDate)}</p>
                </div>
              </div>
              <div style={S.infoChip}>
                <div style={S.locationBox}>
                  {event.isOnline
                    ? <Globe style={S.icon18Faint} />
                    : <MapPin style={S.icon18Faint} />
                  }
                </div>
                <div>
                  <p style={S.infoLabel}>{locationLabel}</p>
                  {locationDetail && <p style={S.infoSub}>{locationDetail}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={S.descriptionBlock}>
              <h2 style={S.sectionTitle}>About This Event</h2>
              <div style={S.descriptionText}>{event.description}</div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div style={S.tagsRow}>
                {event.tags.map((tag) => (
                  <span key={tag.id} style={S.tag}>
                    <Tag style={S.icon11} />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* ── REVIEWS ── */}
            <FeedbackSection
              eventId={event.id}
              canLeaveFeedback={canLeaveFeedback}
              initialFeedbacks={feedbacks}
              initialStats={feedbackStats}
              currentUser={user ? { fullName: user.fullName, imageUrl: user.imageUrl } : null}
            />
          </div>

          {/* ── RIGHT SIDEBAR (desktop) ── */}
          <div className="hidden lg:block">
            <div style={S.sidebarSticky}>
              <div style={S.sidebarCard}>
                <div style={S.sidebarRows}>
                  <SidebarRow icon={<Calendar style={S.icon16Faint} />} label="Date" value={fmtDate(event.startDate)} />
                  <SidebarRow icon={<Clock style={S.icon16Faint} />} label="Time" value={`${fmtTime(event.startDate)} – ${fmtTime(event.endDate)}`} />
                  <SidebarRow
                    icon={event.isOnline ? <Globe style={S.icon16Faint} /> : <MapPin style={S.icon16Faint} />}
                    label={event.isOnline ? "Online" : "Venue"}
                    value={locationLabel}
                  />
                  {event.eventType === "PAID" && (
                    <SidebarRow
                      icon={<CreditCard style={S.icon16Faint} />}
                      label="Price"
                      value={`$${event.price} ${event.currency || ""}`}
                      valueStyle={{ fontSize: "17px", fontWeight: 700, fontFamily: t.serif }}
                    />
                  )}
                </div>

                {/* Capacity bar */}
                <div style={S.capacityBlock}>
                  <div style={S.capacityRow}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users style={S.icon12} />
                      {event.capacity - event.seatsRemaining} / {event.capacity}
                    </span>
                    <span>{event.seatsRemaining > 0 ? `${event.seatsRemaining} spots left` : "Full"}</span>
                  </div>
                  <div style={S.capacityBarWrap}>
                    <div style={{ height: "100%", borderRadius: "2px", width: `${Math.min(seatsPercentage, 100)}%`, background: barColor, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {!isPast && (
                  <p style={S.deadlineText}>
                    Registration closes{" "}
                    <span style={S.deadlineSpan}>{fmtDate(event.registrationDeadline)}</span>
                  </p>
                )}

                <div style={S.actionBtns}>
                  {(canRegister || canPurchase) && (
                    <button style={S.btnPrimary} className="btn-primary-evenza" disabled={registering} onClick={canRegister ? handleRegister : handlePurchase}>
                      <Ticket style={S.icon15} />
                      {canRegister ? "Register for Free" : "Buy Now"}
                    </button>
                  )}
                  {isRegistered && (
                    <>
                      <div style={S.registeredBadge}>
                        <CheckCircle2 style={{ width: "15px", height: "15px", color: t.green }} />
                        <span style={S.registeredText}>
                          {registrationStatus === "PENDING" ? "Pending Approval" : "You're Registered"}
                        </span>
                      </div>
                      {canCancel && (
                        <button style={S.btnSecondary} disabled={registering} onClick={handleCancelRegistration}>
                          Cancel Registration
                        </button>
                      )}
                    </>
                  )}
                  {isPast && !isRegistered && <StatusBox text="This event has ended" bg={t.borderLight} color={t.textMuted} />}
                  {isCancelled && <StatusBox text="This event has been cancelled" bg="rgba(230,57,70,0.06)" color={t.accent} border="rgba(230,57,70,0.15)" />}
                  {isDeadlinePassed && !isRegistered && !isCancelled && <StatusBox text="Registration closed" bg={t.borderLight} color={t.textMuted} />}
                  {isFull && !isRegistered && (
                    <>
                      <StatusBox text="Event is full" bg={t.amberSoft} color={t.amber} border={t.amberBorder} />
                      {event.waitlistEnabled && (
                        <button style={S.btnOutline} disabled={registering} onClick={handleRegister}>
                          Join Waitlist
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {event.approvalRequired && !isRegistered && !isPast && (
                <div style={S.approvalNotice}>
                  <p style={S.approvalText}>
                    <strong>Note:</strong> This event requires organizer approval.
                    Your registration will be reviewed before confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── MOBILE SIDEBAR ── */}
          <div className="lg:hidden" style={{ gridColumn: "1 / -1" }}>
            <div style={S.sidebarCard}>
              <div style={S.sidebarRows}>
                <SidebarRow icon={<Calendar style={S.icon16Faint} />} label="Date" value={fmtDate(event.startDate)} />
                <SidebarRow icon={<Clock style={S.icon16Faint} />} label="Time" value={`${fmtTime(event.startDate)} – ${fmtTime(event.endDate)}`} />
              </div>
              <div style={S.actionBtns}>
                {canRegister ? (
                  <button style={S.btnPrimary} className="btn-primary-evenza" disabled={registering} onClick={handleRegister}>
                    <Ticket style={S.icon15} /> Register for Free
                  </button>
                ) : canPurchase ? (
                  <button style={S.btnPrimary} className="btn-primary-evenza" disabled={registering} onClick={handlePurchase}>
                    <Ticket style={S.icon15} /> Buy Ticket — ${event.price}
                  </button>
                ) : isRegistered ? (
                  <>
                    <div style={{ ...S.registeredBadge, borderRadius: "4px" }}>
                      <CheckCircle2 style={{ width: "15px", height: "15px", color: t.green }} />
                      <span style={S.registeredText}>
                        {registrationStatus === "PENDING" ? "Pending Approval" : "You're Registered"}
                      </span>
                    </div>
                    {canCancel && (
                      <button style={S.btnSecondary} disabled={registering} onClick={handleCancelRegistration}>
                        Cancel Registration
                      </button>
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

/* ─── Helper components ─── */

function SidebarRow({ icon, label, value, valueStyle }: {
  icon: React.ReactNode; label: string; value: string; valueStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
      <div style={{ marginTop: "2px", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.textFaint, margin: "0 0 2px 0" }}>
          {label}
        </p>
        <p style={{ fontSize: "13px", fontWeight: 600, color: t.text, margin: 0, ...valueStyle }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBox({ text, bg, color, border }: { text: string; bg: string; color: string; border?: string; }) {
  return (
    <div style={{ padding: "12px", borderRadius: "5px", textAlign: "center", background: bg, border: border ? `1px solid ${border}` : "none" }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color }}>{text}</span>
    </div>
  );
}