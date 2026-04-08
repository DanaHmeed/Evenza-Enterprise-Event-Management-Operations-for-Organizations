// app/dashboard/events/[eventId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  DollarSign,
  Image as ImageIcon,
  Users,
  FileText,
  Loader2,
  X,
  Eye,
  Save,
} from "lucide-react";
import { t, FormSection, Field, inputStyle, StatusBadge } from "@/components/dashboard/OrganizerUI";
import BannerUpload from "@/components/dashboard/BannerUpload";

interface Category { id: string; name: string; slug: string; }

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");

  const [form, setForm] = useState({
    title: "", summary: "", description: "", categoryId: "",
    tagInput: "", tags: [] as string[],
    startDate: "", endDate: "", registrationDeadline: "", timezone: "",
    isOnline: false, venueName: "", address: "", city: "", country: "", meetingLink: "",
    eventType: "FREE" as "FREE" | "PAID", price: "", currency: "USD",
    capacity: "", waitlistEnabled: false, approvalRequired: false,
    banner: "",
  });

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

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
            title: e.title || "", summary: e.summary || "", description: e.description || "",
            categoryId: e.categoryId || "",
            tagInput: "", tags: e.tags?.map((x: { name: string }) => x.name) || [],
            startDate: toLocal(e.startDate), endDate: toLocal(e.endDate),
            registrationDeadline: toLocal(e.registrationDeadline), timezone: e.timezone || "",
            isOnline: e.isOnline || false, venueName: e.venueName || "", address: e.address || "",
            city: e.city || "", country: e.country || "", meetingLink: e.meetingLink || "",
            eventType: e.eventType || "FREE", price: e.price?.toString() || "", currency: e.currency || "USD",
            capacity: e.capacity?.toString() || "",
            waitlistEnabled: e.waitlistEnabled || false, approvalRequired: e.approvalRequired || false,
            // If existing banner is base64, treat as empty (force re-upload via Cloudinary)
            banner: e.banner && !e.banner.startsWith("data:") ? e.banner : "",
          });
        } else { setMessage({ type: "error", text: "Event not found" }); }
      } catch { setMessage({ type: "error", text: "Failed to load" }); }
      finally { setLoading(false); }
    };
    load();
  }, [eventId]);

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) { set("tags", [...form.tags, tag]); set("tagInput", ""); }
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
    if (!validate()) { setMessage({ type: "error", text: "Please fix errors." }); return; }
    setSubmitting(true); setMessage(null);

    const payload: Record<string, unknown> = {
      title: form.title.trim(), summary: form.summary.trim() || undefined,
      description: form.description.trim(), categoryId: form.categoryId || undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      registrationDeadline: new Date(form.registrationDeadline).toISOString(), timezone: form.timezone,
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
      waitlistEnabled: form.waitlistEnabled, approvalRequired: form.approvalRequired,
      banner: form.banner || null, // null clears the banner if removed
    };
    if (status) payload.status = status;

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setMessage({ type: "success", text: status === "PUBLISHED" ? "Event published!" : "Event updated!" });
        if (status) setCurrentStatus(status);
      } else { const d = await res.json(); setMessage({ type: "error", text: d.error || "Failed" }); }
    } catch { setMessage({ type: "error", text: "Something went wrong" }); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: t.accent }} />
    </div>
  );

  const is = inputStyle;

  return (
    <div style={{ maxWidth: "720px", fontFamily: t.sans }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
        <Link href="/dashboard/events" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", border: `1px solid ${t.borderLight}`, color: t.textMuted, textDecoration: "none" }}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: t.serif, fontSize: "24px", fontWeight: 600, color: t.text, margin: 0 }}>Edit Event</h1>
          <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>Update your event details.</p>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      {message && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "4px", fontSize: "13px", fontWeight: 500, background: message.type === "success" ? t.greenSoft : t.redSoft, color: message.type === "success" ? t.green : t.red }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Basic Info */}
        <FormSection icon={<FileText style={{ width: "16px", height: "16px" }} />} title="Basic Information">
          <Field label="Event Title *" error={errors.title}>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} style={is(errors.title)} maxLength={200} />
          </Field>
          <Field label="Summary"><input type="text" value={form.summary} onChange={(e) => set("summary", e.target.value)} style={is()} maxLength={300} /></Field>
          <Field label="Description *" error={errors.description}>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} style={{ ...is(errors.description), resize: "none" as const, minHeight: "160px", lineHeight: "1.6" }} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Category">
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} style={is()}>
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tags">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: form.tags.length ? "8px" : 0 }}>
                {form.tags.map((tag) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: t.accentSoft, color: t.accent, fontSize: "11px", fontWeight: 600, borderRadius: "3px" }}>
                    {tag}<button onClick={() => set("tags", form.tags.filter((x) => x !== tag))} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 0, display: "flex" }}><X style={{ width: "10px", height: "10px" }} /></button>
                  </span>
                ))}
              </div>
              <input type="text" value={form.tagInput} onChange={(e) => set("tagInput", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} placeholder="Add tag..." style={is()} />
            </Field>
          </div>
        </FormSection>

        {/* Date */}
        <FormSection icon={<Calendar style={{ width: "16px", height: "16px" }} />} title="Date & Time">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Start *" error={errors.startDate}><input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} style={is(errors.startDate)} /></Field>
            <Field label="End *" error={errors.endDate}><input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} style={is(errors.endDate)} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Deadline *" error={errors.registrationDeadline}><input type="datetime-local" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} style={is(errors.registrationDeadline)} /></Field>
            <Field label="Timezone"><input type="text" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} style={is()} /></Field>
          </div>
        </FormSection>

        {/* Location */}
        <FormSection icon={<MapPin style={{ width: "16px", height: "16px" }} />} title="Location">
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            {[{ val: false, label: "In-Person", icon: <MapPin style={{ width: "14px", height: "14px" }} /> }, { val: true, label: "Online", icon: <Globe style={{ width: "14px", height: "14px" }} /> }].map((opt) => (
              <button key={String(opt.val)} type="button" onClick={() => set("isOnline", opt.val)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: 500, fontFamily: t.sans, border: `1px solid ${form.isOnline === opt.val ? t.text : t.border}`, borderRadius: "4px", background: form.isOnline === opt.val ? t.text : t.surface, color: form.isOnline === opt.val ? "#fff" : t.textMuted, cursor: "pointer" }}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
          {form.isOnline ? (
            <Field label="Meeting Link *" error={errors.meetingLink}><input type="url" value={form.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} style={is(errors.meetingLink)} /></Field>
          ) : (
            <>
              <Field label="Venue *" error={errors.venueName}><input type="text" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} style={is(errors.venueName)} /></Field>
              <Field label="Address"><input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} style={is()} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Field label="City *" error={errors.city}><input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} style={is(errors.city)} /></Field>
                <Field label="Country"><input type="text" value={form.country} onChange={(e) => set("country", e.target.value)} style={is()} /></Field>
              </div>
            </>
          )}
        </FormSection>

        {/* Pricing */}
        <FormSection icon={<DollarSign style={{ width: "16px", height: "16px" }} />} title="Pricing">
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            {(["FREE", "PAID"] as const).map((opt) => (
              <button key={opt} type="button" onClick={() => set("eventType", opt)}
                style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 500, fontFamily: t.sans, border: `1px solid ${form.eventType === opt ? t.text : t.border}`, borderRadius: "4px", background: form.eventType === opt ? t.text : t.surface, color: form.eventType === opt ? "#fff" : t.textMuted, cursor: "pointer" }}>
                {opt === "FREE" ? "Free" : "Paid"}
              </button>
            ))}
          </div>
          {form.eventType === "PAID" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Price *" error={errors.price}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textFaint, fontSize: "13px" }}>$</span>
                  <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" step="0.01" style={{ ...is(errors.price), paddingLeft: "28px" }} />
                </div>
              </Field>
              <Field label="Currency"><select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={is()}><option value="USD">USD</option><option value="EUR">EUR</option><option value="ILS">ILS</option><option value="GBP">GBP</option></select></Field>
            </div>
          )}
        </FormSection>

        {/* Capacity */}
        <FormSection icon={<Users style={{ width: "16px", height: "16px" }} />} title="Capacity">
          <Field label="Max Capacity *" error={errors.capacity}><input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} min="1" style={is(errors.capacity)} /></Field>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
            {[{ key: "waitlistEnabled", label: "Enable Waitlist" }, { key: "approvalRequired", label: "Require Approval" }].map((opt) => (
              <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={form[opt.key as keyof typeof form] as boolean} onChange={(e) => set(opt.key, e.target.checked)} style={{ width: "16px", height: "16px", accentColor: t.accent }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Banner — Cloudinary upload */}
        <FormSection icon={<ImageIcon style={{ width: "16px", height: "16px" }} />} title="Cover Image">
          <BannerUpload value={form.banner} onChange={(url) => set("banner", url)} />
        </FormSection>

        {/* Submit */}
        <div style={{ display: "flex", gap: "12px", paddingTop: "8px", paddingBottom: "40px", borderTop: `1px solid ${t.borderLight}` }}>
          <button onClick={() => handleSubmit()} disabled={submitting}
            style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, fontFamily: t.sans, color: "#fff", background: t.text, border: "none", borderRadius: "4px", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? <Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} /> : <Save style={{ width: "16px", height: "16px" }} />}
            Save Changes
          </button>
          {currentStatus === "DRAFT" && (
            <button onClick={() => handleSubmit("PUBLISHED")} disabled={submitting}
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, fontFamily: t.sans, color: t.green, background: "transparent", border: `1px solid ${t.border}`, borderRadius: "4px", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}>
              <Eye style={{ width: "16px", height: "16px" }} /> Publish Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}