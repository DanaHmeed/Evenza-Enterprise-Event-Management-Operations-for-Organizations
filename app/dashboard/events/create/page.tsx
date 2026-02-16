// app/dashboard/events/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
  Upload,
  X,
  Eye,
  Save,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateEventPage() {
  const router = useRouter();

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Date & Time
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Location
  const [isOnline, setIsOnline] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Pricing
  const [eventType, setEventType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Capacity
  const [capacity, setCapacity] = useState("");
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Media
  const [banner, setBanner] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // ─── Tag handlers ───
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // ─── Banner upload (URL for now — integrate UploadThing later) ───
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a local preview. Replace with UploadThing later.
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
        // TODO: Replace with actual upload
        setBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Validation ───
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = "Title is required";
    if (title.length > 200) errs.title = "Title must be under 200 characters";
    if (!description.trim()) errs.description = "Description is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (!endDate) errs.endDate = "End date is required";
    if (!registrationDeadline) errs.registrationDeadline = "Registration deadline is required";
    if (!capacity || parseInt(capacity) < 1) errs.capacity = "Capacity must be at least 1";

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errs.endDate = "End date must be after start date";
    }

    if (
      startDate &&
      registrationDeadline &&
      new Date(registrationDeadline) >= new Date(startDate)
    ) {
      errs.registrationDeadline = "Deadline must be before event start";
    }

    if (eventType === "PAID") {
      if (!price || parseFloat(price) <= 0) errs.price = "Price is required for paid events";
      if (!currency) errs.currency = "Currency is required";
    }

    if (isOnline && !meetingLink.trim()) {
      errs.meetingLink = "Meeting link is required for online events";
    }

    if (!isOnline) {
      if (!venueName.trim()) errs.venueName = "Venue name is required";
      if (!city.trim()) errs.city = "City is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!validate()) {
      setActionMessage({ type: "error", text: "Please fix the errors below." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    const payload = {
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
      status,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/events?created=${status.toLowerCase()}`);
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to create event",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setActionMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-sm text-gray-500">
            Fill in the details below to create your event.
          </p>
        </div>
      </div>

      {/* Message */}
      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            actionMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{actionMessage.text}</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* ─── Basic Info ─── */}
        <FormSection
          icon={<FileText className="w-5 h-5" />}
          title="Basic Information"
        >
          <Field label="Event Title *" error={errors.title}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tech Conference 2025"
              className={inputClass(errors.title)}
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">
              {title.length}/200 characters
            </p>
          </Field>

          <Field label="Summary" sublabel="Short description for cards">
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief one-liner about your event"
              className={inputClass()}
              maxLength={300}
            />
          </Field>

          <Field label="Description *" error={errors.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event in detail — agenda, what to expect, requirements..."
              className={`${inputClass(errors.description)} resize-none`}
              rows={8}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass()}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tags" sublabel="Press Enter to add">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                className={inputClass()}
              />
            </Field>
          </div>
        </FormSection>

        {/* ─── Date & Time ─── */}
        <FormSection
          icon={<Calendar className="w-5 h-5" />}
          title="Date & Time"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date & Time *" error={errors.startDate}>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass(errors.startDate)}
              />
            </Field>
            <Field label="End Date & Time *" error={errors.endDate}>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass(errors.endDate)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Registration Deadline *"
              error={errors.registrationDeadline}
            >
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className={inputClass(errors.registrationDeadline)}
              />
            </Field>
            <Field label="Timezone">
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={inputClass()}
                placeholder="e.g. Asia/Jerusalem"
              />
            </Field>
          </div>
        </FormSection>

        {/* ─── Location ─── */}
        <FormSection
          icon={<MapPin className="w-5 h-5" />}
          title="Location"
        >
          {/* Toggle */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setIsOnline(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                !isOnline
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <MapPin className="w-4 h-4" />
              In-Person
            </button>
            <button
              type="button"
              onClick={() => setIsOnline(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isOnline
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Globe className="w-4 h-4" />
              Online
            </button>
          </div>

          {isOnline ? (
            <Field label="Meeting Link *" error={errors.meetingLink}>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className={inputClass(errors.meetingLink)}
              />
            </Field>
          ) : (
            <div className="space-y-4">
              <Field label="Venue Name *" error={errors.venueName}>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Grand Hall, Conference Center"
                  className={inputClass(errors.venueName)}
                />
              </Field>
              <Field label="Address">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className={inputClass()}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City *" error={errors.city}>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Nablus"
                    className={inputClass(errors.city)}
                  />
                </Field>
                <Field label="Country">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Palestine"
                    className={inputClass()}
                  />
                </Field>
              </div>
            </div>
          )}
        </FormSection>

        {/* ─── Pricing ─── */}
        <FormSection
          icon={<DollarSign className="w-5 h-5" />}
          title="Pricing"
        >
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setEventType("FREE")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                eventType === "FREE"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Free Event
            </button>
            <button
              type="button"
              onClick={() => setEventType("PAID")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                eventType === "PAID"
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Paid Event
            </button>
          </div>

          {eventType === "PAID" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ticket Price *" error={errors.price}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`${inputClass(errors.price)} pl-7`}
                  />
                </div>
              </Field>
              <Field label="Currency *" error={errors.currency}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass(errors.currency)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="ILS">ILS (₪)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </Field>
            </div>
          )}
        </FormSection>

        {/* ─── Capacity & Settings ─── */}
        <FormSection
          icon={<Users className="w-5 h-5" />}
          title="Capacity & Settings"
        >
          <Field label="Maximum Capacity *" error={errors.capacity}>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 100"
              min="1"
              className={inputClass(errors.capacity)}
            />
          </Field>

          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={waitlistEnabled}
                onChange={(e) => setWaitlistEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Enable Waitlist
                </p>
                <p className="text-xs text-gray-500">
                  Allow users to join a waitlist when event is full
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequired(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Require Approval
                </p>
                <p className="text-xs text-gray-500">
                  Manually approve each registration before confirming
                </p>
              </div>
            </label>
          </div>
        </FormSection>

        {/* ─── Cover Image ─── */}
        <FormSection
          icon={<ImageIcon className="w-5 h-5" />}
          title="Cover Image"
        >
          {bannerPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => {
                  setBanner("");
                  setBannerPreview("");
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">
                Click to upload cover image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to 5MB. Recommended: 1200×628
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </label>
          )}
        </FormSection>

        {/* ─── Submit Buttons ─── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-12 border-t border-gray-200">
          <button
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Publish Event
          </button>
          <button
            onClick={() => handleSubmit("DRAFT")}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Components ───

function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  sublabel,
  error,
  children,
}: {
  label: string;
  sublabel?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {sublabel && (
          <span className="font-normal text-gray-400 ml-1">— {sublabel}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/10 ${
    error
      ? "border-red-300 focus:border-red-500 bg-red-50/30"
      : "border-gray-300 focus:border-orange-500 bg-white"
  }`;
}