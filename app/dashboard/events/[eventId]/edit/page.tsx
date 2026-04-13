// app/dashboard/events/[eventId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Calendar,
  MapPin,
  Globe,
  DollarSign,
  Users,
  Loader2,
  X,
  Eye,
  Save,
  ImageIcon,
} from "lucide-react";
import { t, Field, StatusBadge } from "@/components/dashboard/OrganizerUI";
import BannerUpload from "@/components/dashboard/BannerUpload";
import ActionToast from "@/components/modals/ActionToast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

/* ─── inp() ────────────────────────────────────────────────────────────── */
function inp(error?: string, extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    fontFamily: "Rubik, sans-serif",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: error ? t.red : t.border,
    borderRadius: 4,
    outline: "none",
    color: t.text,
    background: "#fff",
    boxSizing: "border-box",
    ...extra,
  };
}

/* ─── SectionLabel ─────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: t.textFaint, margin: "0 0 14px",
    }}>
      {children}
    </p>
  );
}

/* ─── Divider ──────────────────────────────────────────────────────────── */
function Divider() {
  return <hr style={{ border: "none", borderTop: `1px solid ${t.borderLight}`, margin: "20px 0" }} />;
}

/* ─── RadioPill ────────────────────────────────────────────────────────── */
function RadioPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 14px", fontSize: 12, fontWeight: 500,
        fontFamily: "Rubik, sans-serif",
        borderWidth: "1px", borderStyle: "solid",
        borderColor: active ? t.text : t.border,
        borderRadius: 4,
        background: active ? t.text : "transparent",
        color: active ? "#fff" : t.textMuted,
        cursor: "pointer", transition: "all 0.12s",
      }}
    >
      <span style={{
        width: 12, height: 12, borderRadius: "50%",
        borderWidth: "2px", borderStyle: "solid",
        borderColor: active ? "#fff" : t.border,
        background: active ? "#fff" : "transparent",
        flexShrink: 0, transition: "all 0.12s",
      }} />
      {label}
    </button>
  );
}

/* ─── ToggleRow ────────────────────────────────────────────────────────── */
function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 15, height: 15, marginTop: 2, accentColor: t.accent }}
      />
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: t.textFaint, margin: "1px 0 0" }}>{desc}</p>}
      </div>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════════════ */
export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"SAVE" | "PUBLISHED" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStatus, setCurrentStatus] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState({
    title: "", summary: "", description: "", categoryId: "",
    tagInput: "", tags: [] as string[],
    startDate: "", endDate: "", registrationDeadline: "", timezone: "",
    isOnline: false, venueName: "", address: "", city: "", country: "", meetingLink: "",
    eventType: "FREE" as "FREE" | "PAID", price: "", currency: "USD",
    capacity: "", waitlistEnabled: false, approvalRequired: false,
    banner: "",
  });

  const set = (field: string, value: unknown) =>
    setForm((p) => ({ ...p, [field]: value }));

  const toLocal = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, eventRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/events/${eventId}`),
        ]);
        if (catRes.ok) { const d = await catRes.json(); setCategories(d.data || []); }
        if (eventRes.ok) {
          const d = await eventRes.json();
          const e = d.data || d;
          setCurrentStatus(e.status || "DRAFT");
          setForm({
            title: e.title || "",
            summary: e.summary || "",
            description: e.description || "",
            categoryId: e.categoryId || "",
            tagInput: "",
            tags: e.tags?.map((x: { name: string }) => x.name) || [],
            startDate: toLocal(e.startDate),
            endDate: toLocal(e.endDate),
            registrationDeadline: toLocal(e.registrationDeadline),
            timezone: e.timezone || "",
            isOnline: e.isOnline || false,
            venueName: e.venueName || "",
            address: e.address || "",
            city: e.city || "",
            country: e.country || "",
            meetingLink: e.meetingLink || "",
            eventType: e.eventType || "FREE",
            price: e.price?.toString() || "",
            currency: e.currency || "USD",
            capacity: e.capacity?.toString() || "",
            waitlistEnabled: e.waitlistEnabled || false,
            approvalRequired: e.approvalRequired || false,
            banner: e.banner && !e.banner.startsWith("data:") ? e.banner : "",
          });
        } else {
          setToast({ message: "Event not found", variant: "error" });
        }
      } catch {
        setToast({ message: "Failed to load event", variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      set("tags", [...form.tags, tag]);
      set("tagInput", "");
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (!form.startDate) errs.startDate = "Required";
    if (!form.endDate) errs.endDate = "Required";
    if (!form.registrationDeadline) errs.registrationDeadline = "Required";
    if (!form.capacity || parseInt(form.capacity) < 1) errs.capacity = "Min 1";
    if (form.eventType === "PAID" && (!form.price || parseFloat(form.price) <= 0)) errs.price = "Required";
    if (form.isOnline && !form.meetingLink.trim()) errs.meetingLink = "Required";
    if (!form.isOnline && !form.venueName.trim()) errs.venueName = "Required";
    if (!form.isOnline && !form.city.trim()) errs.city = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (status?: string) => {
    if (!validate()) {
      setToast({ message: "Fix the errors below", description: "Some required fields are missing or invalid.", variant: "error" });
      return;
    }
    setSubmitting(true);
    setSubmitMode(status === "PUBLISHED" ? "PUBLISHED" : "SAVE");

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      summary: form.summary.trim() || undefined,
      description: form.description.trim(),
      categoryId: form.categoryId || undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(),
      timezone: form.timezone,
      isOnline: form.isOnline,
      venueName: !form.isOnline ? form.venueName.trim() : undefined,
      address: !form.isOnline ? form.address.trim() || undefined : undefined,
      city: !form.isOnline ? form.city.trim() : undefined,
      country: !form.isOnline ? form.country.trim() || undefined : undefined,
      meetingLink: form.isOnline ? form.meetingLink.trim() : undefined,
      eventType: form.eventType,
      price: form.eventType === "PAID" ? parseFloat(form.price) : undefined,
      currency: form.eventType === "PAID" ? form.currency : undefined,
      capacity: parseInt(form.capacity),
      waitlistEnabled: form.waitlistEnabled,
      approvalRequired: form.approvalRequired,
      banner: form.banner || null,
    };
    if (status) payload.status = status;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (status) setCurrentStatus(status);
        setToast({
          message: status === "PUBLISHED" ? "Event published!" : "Changes saved",
          description: status === "PUBLISHED"
            ? "Your event is now live and visible to attendees."
            : "Your event has been updated successfully.",
          variant: "success",
        });
      } else {
        const d = await res.json();
        setToast({ message: "Failed to save", description: d.error || "Something went wrong.", variant: "error" });
      }
    } catch {
      setToast({ message: "Network error", description: "Please check your connection and try again.", variant: "error" });
    } finally {
      setSubmitting(false);
      setSubmitMode(null);
    }
  };

  /* ── shared card wrapper ── */
  const card: React.CSSProperties = {
    background: "#fff",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: t.borderLight,
    borderRadius: 6,
    padding: "20px 22px",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: t.accent }} />
    </div>
  );

  return (
    <>
      {toast && (
        <ActionToast {...toast} duration={4000} onClose={() => setToast(null)} />
      )}

      <div style={{ fontFamily: "Rubik, sans-serif", minHeight: "100vh", background: "#f7f7f4" }}>

        {/* ── Sticky top bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "#fff", borderBottom: `1px solid ${t.borderLight}`,
          padding: "0 24px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
            <Link href="/dashboard/events" style={{ color: t.textMuted, textDecoration: "none", fontWeight: 500 }}>
              Events
            </Link>
            <ChevronRight style={{ width: 13, height: 13, opacity: 0.4 }} />
            <span style={{ color: t.text, fontWeight: 600 }}>Edit Event</span>
          </div>

          {/* Status badge + top CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={currentStatus} />
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 16px", fontSize: 13, fontWeight: 500,
                fontFamily: "Rubik, sans-serif",
                borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
                borderRadius: 4, background: "#fff", color: t.textSecondary,
                cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting && submitMode === "SAVE"
                ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                : <Save style={{ width: 13, height: 13 }} />}
              Save Changes
            </button>
            {currentStatus === "DRAFT" && (
              <button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={submitting}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 18px", fontSize: 13, fontWeight: 600,
                  fontFamily: "Rubik, sans-serif",
                  border: "none", borderRadius: 4,
                  background: t.text, color: "#fff",
                  cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting && submitMode === "PUBLISHED"
                  ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                  : <Eye style={{ width: 13, height: 13 }} />}
                Publish Now
              </button>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{
          maxWidth: 1140, margin: "0 auto", padding: "28px 24px 60px",
          display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start",
        }}>

          {/* ════ LEFT COLUMN ════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ marginBottom: 4 }}>
              <h1 style={{ fontFamily: "Rubik, sans-serif", fontSize: 26, fontWeight: 500, color: t.text, margin: 0 }}>
                Edit Event
              </h1>
              <p style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
                Update your event details below.
              </p>
            </div>

            {/* Basic Information */}
            <div style={card}>
              <SectionLabel>Basic Information</SectionLabel>

              <Field label="Event Title *" error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  style={inp(errors.title)}
                  maxLength={200}
                />
                <span style={{ fontSize: 11, color: t.textFaint, display: "block", marginTop: 3 }}>
                  {form.title.length}/200
                </span>
              </Field>

              <Field label="Summary" sublabel="Short description shown on event cards">
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  style={inp()}
                  maxLength={200}
                />
              </Field>

              <Field label="Description *" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  style={inp(errors.description, { resize: "none", minHeight: 160, lineHeight: 1.65 })}
                />
              </Field>
            </div>

            {/* Date & Time */}
            <div style={card}>
              <SectionLabel>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Calendar style={{ width: 11, height: 11 }} /> Date &amp; Time
                </span>
              </SectionLabel>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Start *" error={errors.startDate}>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} style={inp(errors.startDate)} />
                </Field>
                <Field label="End *" error={errors.endDate}>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} style={inp(errors.endDate)} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <Field label="Registration Deadline *" error={errors.registrationDeadline}>
                  <input type="datetime-local" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} style={inp(errors.registrationDeadline)} />
                </Field>
                <Field label="Timezone">
                  <input type="text" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} style={inp()} />
                </Field>
              </div>
            </div>

            {/* Location */}
            <div style={card}>
              <SectionLabel>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin style={{ width: 11, height: 11 }} /> Location
                </span>
              </SectionLabel>

              <div style={{
                display: "flex", gap: 4, marginBottom: 16,
                background: t.borderLight, borderRadius: 5, padding: 3, width: "fit-content",
              }}>
                {[
                  { val: false, label: "In-Person", icon: <MapPin style={{ width: 12, height: 12 }} /> },
                  { val: true,  label: "Online",    icon: <Globe  style={{ width: 12, height: 12 }} /> },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => set("isOnline", opt.val)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "6px 14px", fontSize: 12, fontWeight: 500,
                      fontFamily: "Rubik, sans-serif",
                      border: "none", borderRadius: 4,
                      background: form.isOnline === opt.val ? "#fff" : "transparent",
                      color: form.isOnline === opt.val ? t.text : t.textFaint,
                      cursor: "pointer",
                      boxShadow: form.isOnline === opt.val ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>

              {form.isOnline ? (
                <Field label="Meeting Link *" error={errors.meetingLink}>
                  <input type="url" value={form.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} placeholder="https://zoom.us/j/..." style={inp(errors.meetingLink)} />
                </Field>
              ) : (
                <>
                  <Field label="Venue Name *" error={errors.venueName}>
                    <input type="text" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} style={inp(errors.venueName)} />
                  </Field>
                  <Field label="Address">
                    <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} style={inp()} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="City *" error={errors.city}>
                      <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} style={inp(errors.city)} />
                    </Field>
                    <Field label="Country">
                      <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)} style={inp()} />
                    </Field>
                  </div>
                </>
              )}
            </div>

            {/* Pricing */}
            <div style={card}>
              <SectionLabel>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <DollarSign style={{ width: 11, height: 11 }} /> Pricing
                </span>
              </SectionLabel>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <RadioPill label="Free Event" active={form.eventType === "FREE"} onClick={() => set("eventType", "FREE")} />
                <RadioPill label="Paid Event" active={form.eventType === "PAID"} onClick={() => set("eventType", "PAID")} />
              </div>

              {form.eventType === "PAID" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Ticket Price *" error={errors.price}>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: 13, pointerEvents: "none" }}>$</span>
                      <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" step="0.01" placeholder="0.00" style={inp(errors.price, { paddingLeft: 28 })} />
                    </div>
                  </Field>
                  <Field label="Currency">
                    <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={inp()}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="ILS">ILS (₪)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </Field>
                </div>
              )}
            </div>

          </div>
          {/* end left column */}

          {/* ════ RIGHT SIDEBAR ══════════════════════════════════════════ */}
          <div style={{ position: "sticky", top: 68, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Cover Image */}
            <div style={card}>
              <SectionLabel>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ImageIcon style={{ width: 11, height: 11 }} /> Cover Image
                </span>
              </SectionLabel>
              <BannerUpload value={form.banner} onChange={(url) => set("banner", url)} />
            </div>

            {/* Event Details */}
            <div style={card}>
              <SectionLabel>Event Details</SectionLabel>

              <Field label="Category">
                <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} style={inp(undefined, { fontSize: 12 })}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tags" sublabel="Press Enter to add (max 10)">
                {form.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {form.tags.map((tag) => (
                      <span key={tag} style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "2px 8px", background: t.accentSoft, color: t.accent,
                        fontSize: 11, fontWeight: 600, borderRadius: 3,
                      }}>
                        {tag}
                        <button
                          onClick={() => set("tags", form.tags.filter((x) => x !== tag))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 0, display: "flex" }}
                        >
                          <X style={{ width: 9, height: 9 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={form.tagInput}
                  onChange={(e) => set("tagInput", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag…"
                  style={inp(undefined, { fontSize: 12 })}
                />
              </Field>
            </div>

            {/* Capacity & Settings */}
            <div style={card}>
              <SectionLabel>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Users style={{ width: 11, height: 11 }} /> Capacity &amp; Settings
                </span>
              </SectionLabel>

              <Field label="Maximum Capacity *" error={errors.capacity}>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                  min="1"
                  placeholder="e.g. 100"
                  style={inp(errors.capacity, { fontSize: 12 })}
                />
              </Field>

              <Divider />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ToggleRow
                  label="Enable Waitlist"
                  desc="Let users join a waitlist when full"
                  checked={form.waitlistEnabled}
                  onChange={(v) => set("waitlistEnabled", v)}
                />
                <ToggleRow
                  label="Require Approval"
                  desc="Manually approve each registration"
                  checked={form.approvalRequired}
                  onChange={(v) => set("approvalRequired", v)}
                />
              </div>
            </div>

            {/* Sidebar submit buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                style={{
                  width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 24px", fontSize: 13, fontWeight: 600, fontFamily: "Rubik, sans-serif",
                  color: "#fff", background: t.text, border: "none", borderRadius: 4,
                  cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting && submitMode === "SAVE"
                  ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                  : <Save style={{ width: 14, height: 14 }} />}
                Save Changes
              </button>

              {currentStatus === "DRAFT" && (
                <button
                  onClick={() => handleSubmit("PUBLISHED")}
                  disabled={submitting}
                  style={{
                    width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px 24px", fontSize: 13, fontWeight: 600, fontFamily: "Rubik, sans-serif",
                    color: t.green, background: "transparent",
                    borderWidth: "1px", borderStyle: "solid", borderColor: t.border,
                    borderRadius: 4,
                    cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting && submitMode === "PUBLISHED"
                    ? <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                    : <Eye style={{ width: 14, height: 14 }} />}
                  Publish Now
                </button>
              )}

              <p style={{ fontSize: 11, color: t.textFaint, textAlign: "center", margin: "2px 0 0" }}>
                {currentStatus === "DRAFT"
                  ? "Draft events are not visible to attendees."
                  : "Changes are saved and live immediately."}
              </p>
            </div>

          </div>
          {/* end sidebar */}

        </div>
      </div>
    </>
  );
}