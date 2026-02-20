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
  Tag,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Eye,
  Save,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [eventType, setEventType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [capacity, setCapacity] = useState("");
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [banner, setBanner] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch categories + event data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, eventRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/events/${eventId}`),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          const e = eventData.data || eventData;

          setTitle(e.title || "");
          setSummary(e.summary || "");
          setDescription(e.description || "");
          setCategoryId(e.categoryId || "");
          setTags(e.tags?.map((t: { name: string }) => t.name) || []);
          setStartDate(toLocalDatetime(e.startDate));
          setEndDate(toLocalDatetime(e.endDate));
          setRegistrationDeadline(toLocalDatetime(e.registrationDeadline));
          setTimezone(e.timezone || "");
          setIsOnline(e.isOnline || false);
          setVenueName(e.venueName || "");
          setAddress(e.address || "");
          setCity(e.city || "");
          setCountry(e.country || "");
          setMeetingLink(e.meetingLink || "");
          setEventType(e.eventType || "FREE");
          setPrice(e.price?.toString() || "");
          setCurrency(e.currency || "USD");
          setCapacity(e.capacity?.toString() || "");
          setWaitlistEnabled(e.waitlistEnabled || false);
          setApprovalRequired(e.approvalRequired || false);
          setBanner(e.banner || "");
          setBannerPreview(e.banner || "");
          setCurrentStatus(e.status || "DRAFT");
        } else {
          setActionMessage({ type: "error", text: "Event not found" });
        }
      } catch {
        setActionMessage({ type: "error", text: "Failed to load event" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
        setBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";
    if (!registrationDeadline) errs.registrationDeadline = "Deadline is required";
    if (!capacity || parseInt(capacity) < 1) errs.capacity = "Capacity must be at least 1";
    if (eventType === "PAID" && (!price || parseFloat(price) <= 0)) errs.price = "Price required";
    if (isOnline && !meetingLink.trim()) errs.meetingLink = "Meeting link required";
    if (!isOnline && !venueName.trim()) errs.venueName = "Venue name required";
    if (!isOnline && !city.trim()) errs.city = "City required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (status?: string) => {
    if (!validate()) {
      setActionMessage({ type: "error", text: "Please fix the errors below." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    const payload: Record<string, unknown> = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      description: description.trim(),
      categoryId: categoryId || undefined,
      tags: tags.length > 0 ? tags : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      timezone,
      isOnline,
      venueName: !isOnline ? venueName.trim() : undefined,
      address: !isOnline ? address.trim() || undefined : undefined,
      city: !isOnline ? city.trim() : undefined,
      country: !isOnline ? country.trim() || undefined : undefined,
      meetingLink: isOnline ? meetingLink.trim() : undefined,
      eventType,
      price: eventType === "PAID" ? parseFloat(price) : undefined,
      currency: eventType === "PAID" ? currency : undefined,
      capacity: parseInt(capacity),
      waitlistEnabled,
      approvalRequired,
      banner: banner || undefined,
    };

    if (status) payload.status = status;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "Event updated successfully!" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const data = await res.json();
        setActionMessage({ type: "error", text: data.error || "Failed to update" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
      </div>
    );
  }

  const inputClass = (error?: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/10 ${
      error ? "border-red-300 focus:border-red-500 bg-red-50/30" : "border-gray-300 focus:border-orange-500 bg-white"
    }`;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/events"
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-sm text-gray-500">Update your event details.</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          currentStatus === "PUBLISHED" ? "bg-green-100 text-green-700" :
          currentStatus === "DRAFT" ? "bg-gray-100 text-gray-600" :
          "bg-red-100 text-red-600"
        }`}>
          {currentStatus}
        </span>
      </div>

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
          actionMessage.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{actionMessage.text}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Info */}
        <FormSection icon={<FileText className="w-5 h-5" />} title="Basic Information">
          <Field label="Event Title *" error={errors.title}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass(errors.title)} maxLength={200} />
          </Field>
          <Field label="Summary">
            <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} className={inputClass()} maxLength={300} />
          </Field>
          <Field label="Description *" error={errors.description}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass(errors.description)} resize-none`} rows={8} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass()}>
                <option value="">Select a category</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </Field>
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                    {tag}<button onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add tag..." className={inputClass()} />
            </Field>
          </div>
        </FormSection>

        {/* Date & Time */}
        <FormSection icon={<Calendar className="w-5 h-5" />} title="Date & Time">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start *" error={errors.startDate}>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass(errors.startDate)} />
            </Field>
            <Field label="End *" error={errors.endDate}>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass(errors.endDate)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Registration Deadline *" error={errors.registrationDeadline}>
              <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className={inputClass(errors.registrationDeadline)} />
            </Field>
            <Field label="Timezone">
              <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass()} />
            </Field>
          </div>
        </FormSection>

        {/* Location */}
        <FormSection icon={<MapPin className="w-5 h-5" />} title="Location">
          <div className="flex gap-3 mb-4">
            <button type="button" onClick={() => setIsOnline(false)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${!isOnline ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-gray-200 text-gray-600"}`}>
              <MapPin className="w-4 h-4" />In-Person
            </button>
            <button type="button" onClick={() => setIsOnline(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${isOnline ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-gray-200 text-gray-600"}`}>
              <Globe className="w-4 h-4" />Online
            </button>
          </div>
          {isOnline ? (
            <Field label="Meeting Link *" error={errors.meetingLink}>
              <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className={inputClass(errors.meetingLink)} />
            </Field>
          ) : (
            <div className="space-y-4">
              <Field label="Venue Name *" error={errors.venueName}>
                <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} className={inputClass(errors.venueName)} />
              </Field>
              <Field label="Address"><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass()} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City *" error={errors.city}><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass(errors.city)} /></Field>
                <Field label="Country"><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass()} /></Field>
              </div>
            </div>
          )}
        </FormSection>

        {/* Pricing */}
        <FormSection icon={<DollarSign className="w-5 h-5" />} title="Pricing">
          <div className="flex gap-3 mb-4">
            <button type="button" onClick={() => setEventType("FREE")} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${eventType === "FREE" ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600"}`}>Free</button>
            <button type="button" onClick={() => setEventType("PAID")} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${eventType === "PAID" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-gray-200 text-gray-600"}`}>Paid</button>
          </div>
          {eventType === "PAID" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price *" error={errors.price}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className={`${inputClass(errors.price)} pl-7`} />
                </div>
              </Field>
              <Field label="Currency">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass()}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="ILS">ILS</option><option value="GBP">GBP</option>
                </select>
              </Field>
            </div>
          )}
        </FormSection>

        {/* Capacity */}
        <FormSection icon={<Users className="w-5 h-5" />} title="Capacity & Settings">
          <Field label="Maximum Capacity *" error={errors.capacity}>
            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" className={inputClass(errors.capacity)} />
          </Field>
          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={waitlistEnabled} onChange={(e) => setWaitlistEnabled(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <div><p className="text-sm font-medium text-gray-900">Enable Waitlist</p></div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={approvalRequired} onChange={(e) => setApprovalRequired(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
              <div><p className="text-sm font-medium text-gray-900">Require Approval</p></div>
            </label>
          </div>
        </FormSection>

        {/* Banner */}
        <FormSection icon={<ImageIcon className="w-5 h-5" />} title="Cover Image">
          {bannerPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={bannerPreview} alt="Banner" className="w-full h-48 object-cover" />
              <button onClick={() => { setBanner(""); setBannerPreview(""); }} className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Click to upload</p>
              <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
            </label>
          )}
        </FormSection>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-12 border-t border-gray-200">
          <button onClick={() => handleSubmit()} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          {currentStatus === "DRAFT" && (
            <button onClick={() => handleSubmit("PUBLISHED")} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-green-300 text-green-700 font-semibold hover:bg-green-50 transition-all disabled:opacity-50">
              <Eye className="w-4 h-4" />Publish Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">{icon}</div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}