// app/(root)/profile/page.tsx
//
// 1. Single API call via /profile-summary (was 2 parallel calls)
// 2. next/image for avatar & event banners (auto-resize, lazy load, WebP)
// 3. Memoized date formatting
// 4. Reduced re-renders with stable references

"use client";
import "@/styles/globals.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Calendar,
  Ticket,
  CalendarDays,
  Loader2,
  MapPin,
  Globe,
  Pencil,
  ChevronRight,
  CreditCard,
  Phone,
  Briefcase,
  Building2,
  Clock,
  Shield,
  Crown,
  Sparkles,
  Save,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Design tokens
   ═══════════════════════════════════════════ */
const t = {
  bg: "#fafaf8",
  surface: "#fff",
  border: "#e5e5e0",
  borderLight: "#f0f0ec",
  text: "#1a1a1a",
  textSecondary: "#555",
  textMuted: "#888",
  textFaint: "#aaa",
  accent: "#e63946",
  accentSoft: "rgba(230,57,70,0.07)",
  green: "#2d6a4f",
  greenSoft: "rgba(45,106,79,0.08)",
  dark: "#1a1a2e",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  organization?: string | null;
  industry?: string | null;
  experience?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    registrations: number;
    organizedEvents: number;
    feedbacks: number;
    tickets: number;
    orders: number;
  };
}

interface RecentRegistration {
  id: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    isOnline: boolean;
    city?: string | null;
    banner?: string | null;
  };
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    jobTitle: "",
    organization: "",
    industry: "",
    experience: "",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/profile");
      return;
    }

    // ✅ OPTIMIZATION: Single API call instead of two parallel calls
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}/profile-summary`);
        if (res.ok) {
          const data = await res.json();
          const p = data.data.profile;
          setProfile(p);
          setForm({
            name: p.name || "",
            phone: p.phone || "",
            location: p.location || "",
            bio: p.bio || "",
            jobTitle: p.jobTitle || "",
            organization: p.organization || "",
            industry: p.industry || "",
            experience: p.experience || "",
          });
          setRecentEvents(data.data.recentRegistrations || []);
        }
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user, router]);

  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, ...form } : prev));
        setEditing(false);
      }
    } catch {
      console.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [user?.id, form]);

  const handleCancel = useCallback(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
      jobTitle: profile.jobTitle || "",
      organization: profile.organization || "",
      industry: profile.industry || "",
      experience: profile.experience || "",
    });
    setEditing(false);
  }, [profile]);

  const updateField = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Memoized computations ──
  const formatDate = useCallback(
    (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const memberSince = useMemo(() => {
    if (!profile) return "";
    const months = Math.floor(
      (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (months < 1) return "This month";
    if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""}`;
  }, [profile?.createdAt]);

  const navLinks = useMemo(() => {
    if (!profile) return [];
    const links = [
      {
        label: "My Tickets",
        desc: "QR passes & entry codes",
        href: "/my-tickets",
        icon: <Ticket style={{ width: "18px", height: "18px" }} />,
        count: profile._count?.tickets || 0,
      },
      {
        label: "Event History",
        desc: "All registrations by date",
        href: "/profile/events",
        icon: <CalendarDays style={{ width: "18px", height: "18px" }} />,
        count: profile._count?.registrations || 0,
      },
      {
        label: "Purchase History",
        desc: "Orders & receipts",
        href: "/orders",
        icon: <CreditCard style={{ width: "18px", height: "18px" }} />,
        count: profile._count?.orders || 0,
      },
    ];

    if (profile.role === "ORGANIZER" || profile.role === "ADMIN") {
      links.push({
        label: "Organized Events",
        desc: "Events you created",
        href: "/organizer/events",
        icon: <Calendar style={{ width: "18px", height: "18px" }} />,
        count: profile._count?.organizedEvents || 0,
      });
    }
    return links;
  }, [profile]);

  const stats = useMemo(() => {
    if (!profile) return [];
    const s = [
      { label: "Registrations", value: profile._count?.registrations || 0 },
      { label: "Tickets", value: profile._count?.tickets || 0 },
      { label: "Reviews", value: profile._count?.feedbacks || 0 },
    ];
    if (profile.role !== "USER") {
      s.push({ label: "Organized", value: profile._count?.organizedEvents || 0 });
    }
    return s;
  }, [profile]);

  // ─── Loading ───
  if (!isLoaded || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: t.sans,
        }}
      >
        <Loader2
          className="animate-spin"
          style={{ width: "24px", height: "24px", color: t.accent }}
        />
      </div>
    );
  }

  if (!profile) return null;

  // ─── Role config ───
  const roleMap: Record<string, { icon: React.ReactNode; label: string }> = {
    ADMIN: { icon: <Crown style={{ width: "12px", height: "12px" }} />, label: "Administrator" },
    ORGANIZER: {
      icon: <Sparkles style={{ width: "12px", height: "12px" }} />,
      label: "Event Organizer",
    },
    USER: { icon: <Shield style={{ width: "12px", height: "12px" }} />, label: "Member" },
  };
  const rc = roleMap[profile.role] || roleMap.USER;

  return (
    <div style={{ background: t.bg, fontFamily: t.sans, minHeight: "100vh" }}>
      {/* ═══════════════════════════════════
          HEADER
          ═══════════════════════════════════ */}
      <div
        style={{ background: t.dark, height: "180px", position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "20%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(230,57,70,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px 80px" }}>
        {/* ═══════════════════════════════════
            PROFILE CARD
            ═══════════════════════════════════ */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: "6px",
            marginTop: "-80px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Avatar + Name row */}
          <div
            style={{
              padding: "0 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: "20px",
            }}
          >
            {/* ✅ Avatar with next/image */}
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                border: `3px solid ${t.surface}`,
                overflow: "hidden",
                marginTop: "-48px",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              {profile.avatar || user?.imageUrl ? (
                <Image
                  src={profile.avatar || user?.imageUrl || ""}
                  alt={profile.name}
                  width={96}
                  height={96}
                  style={{ objectFit: "cover" }}
                  priority // Above the fold — load immediately
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: t.dark,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: t.serif,
                    }}
                  >
                    {profile.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: "20px", paddingTop: "16px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
              >
                <h1
                  style={{
                    fontFamily: t.serif,
                    fontSize: "24px",
                    fontWeight: 600,
                    color: t.text,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {profile.name}
                </h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 10px",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    borderRadius: "3px",
                    background: t.borderLight,
                    color: t.textSecondary,
                  }}
                >
                  {rc.icon}
                  {rc.label}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: t.textMuted, margin: "4px 0 0" }}>
                Member for {memberSince} · Joined {formatDate(profile.createdAt)}
              </p>
            </div>

            {/* Edit / Save buttons */}
            <div style={{ paddingBottom: "20px", display: "flex", gap: "8px", flexShrink: 0 }}>
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: t.textSecondary,
                      background: "transparent",
                      border: `1px solid ${t.border}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontFamily: t.sans,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fff",
                      background: t.text,
                      border: "none",
                      borderRadius: "4px",
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.6 : 1,
                      fontFamily: t.sans,
                    }}
                  >
                    {saving ? (
                      <Loader2
                        className="animate-spin"
                        style={{ width: "14px", height: "14px" }}
                      />
                    ) : (
                      <Save style={{ width: "14px", height: "14px" }} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: t.textSecondary,
                    background: "transparent",
                    border: `1px solid ${t.border}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: t.sans,
                  }}
                >
                  <Pencil style={{ width: "13px", height: "13px" }} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: t.borderLight }} />

          {/* ── FORM SECTIONS ── */}
          <div style={{ padding: "32px" }}>
            <SectionHeader title="Basic Information" />
            <div
              className="grid sm:grid-cols-2 grid-cols-1"
              style={{ display: "grid", gap: "20px", marginBottom: "36px" }}
            >
              <Field
                label="Full Name"
                value={form.name}
                onChange={(v) => updateField("name", v)}
                editing={editing}
                placeholder="Your full name"
                required
              />
              <Field
                label="Email"
                value={profile.email}
                editing={false}
                disabled
                icon={<Mail style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                editing={editing}
                placeholder="+970 59 xxx xxxx"
                icon={<Phone style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
              <Field
                label="Location"
                value={form.location}
                onChange={(v) => updateField("location", v)}
                editing={editing}
                placeholder="City, Country"
                icon={<MapPin style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
            </div>

            <SectionHeader title="Professional Details" />
            <div
              className="grid sm:grid-cols-2 grid-cols-1"
              style={{ display: "grid", gap: "20px", marginBottom: "36px" }}
            >
              <Field
                label="Job Title / Position"
                value={form.jobTitle}
                onChange={(v) => updateField("jobTitle", v)}
                editing={editing}
                placeholder="e.g. Software Engineer"
                icon={<Briefcase style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
              <Field
                label="Organization / University"
                value={form.organization}
                onChange={(v) => updateField("organization", v)}
                editing={editing}
                placeholder="e.g. An-Najah University"
                icon={<Building2 style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
              <Field
                label="Industry"
                value={form.industry}
                onChange={(v) => updateField("industry", v)}
                editing={editing}
                placeholder="e.g. Technology"
              />
              <Field
                label="Years of Experience"
                value={form.experience}
                onChange={(v) => updateField("experience", v)}
                editing={editing}
                placeholder="e.g. 3 years"
                icon={<Clock style={{ width: "14px", height: "14px", color: t.textFaint }} />}
              />
            </div>

            <SectionHeader title="Bio" />
            {editing ? (
              <textarea
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="Tell us about yourself or your organization..."
                maxLength={500}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  fontFamily: t.sans,
                  color: t.text,
                  background: t.bg,
                  border: `1px solid ${t.border}`,
                  borderRadius: "4px",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.6,
                }}
              />
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: form.bio ? t.textSecondary : t.textFaint,
                  fontStyle: form.bio ? "normal" : "italic",
                  margin: 0,
                }}
              >
                {form.bio || "No bio yet. Click Edit Profile to add one."}
              </p>
            )}
            {editing && (
              <p style={{ fontSize: "11px", color: t.textFaint, marginTop: "6px" }}>
                {form.bio.length}/500
              </p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════
            STATS
            ═══════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: "1px",
            background: t.borderLight,
            borderRadius: "6px",
            overflow: "hidden",
            marginTop: "20px",
          }}
        >
          {stats.map((stat, i) => (
            <div key={i} style={{ background: t.surface, padding: "24px 0", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: t.serif,
                  fontSize: "24px",
                  fontWeight: 600,
                  color: t.text,
                  margin: "0 0 2px 0",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════
            QUICK ACCESS
            ═══════════════════════════════════ */}
        <div style={{ marginTop: "32px" }}>
          <SectionHeader title="Quick Access" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  background: t.surface,
                  border: `1px solid ${t.borderLight}`,
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.borderLight;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.borderLight,
                    borderRadius: "6px",
                    color: t.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0 }}>
                    {link.label}
                  </p>
                  <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>
                    {link.desc}
                  </p>
                </div>
                {link.count > 0 && (
                  <span style={{ fontSize: "13px", fontWeight: 600, color: t.textFaint }}>
                    {link.count}
                  </span>
                )}
                <ChevronRight style={{ width: "16px", height: "16px", color: t.borderLight }} />
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════
            RECENT ACTIVITY
            ═══════════════════════════════════ */}
        {recentEvents.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <SectionHeader title="Recent Activity" noMargin />
              <Link
                href="/profile/events"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: t.accent,
                  textDecoration: "none",
                }}
              >
                View all
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentEvents.map((reg) => {
                const dotColors: Record<string, string> = {
                  APPROVED: t.green,
                  PENDING: "#b45309",
                  REJECTED: t.accent,
                  CANCELLED: t.textFaint,
                };
                return (
                  <Link
                    key={reg.id}
                    href={`/events/${reg.event.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 20px",
                      background: t.surface,
                      border: `1px solid ${t.borderLight}`,
                      borderRadius: "6px",
                      textDecoration: "none",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.border)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = t.borderLight)}
                  >
                    {/* ✅ Thumbnail with next/image */}
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: t.borderLight,
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {reg.event.banner ? (
                        <Image
                          src={reg.event.banner}
                          alt=""
                          width={44}
                          height={44}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CalendarDays
                            style={{ width: "18px", height: "18px", color: t.textFaint }}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: t.text,
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {reg.event.title}
                      </p>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: dotColors[reg.status] || t.textFaint,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "12px", color: t.textMuted }}>
                          {reg.status.charAt(0) + reg.status.slice(1).toLowerCase()}
                        </span>
                        <span style={{ color: t.borderLight }}>·</span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: t.textFaint,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {reg.event.isOnline ? (
                            <Globe style={{ width: "11px", height: "11px" }} />
                          ) : (
                            <MapPin style={{ width: "11px", height: "11px" }} />
                          )}
                          {reg.event.isOnline ? "Online" : reg.event.city || "TBA"}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{ fontSize: "12px", fontWeight: 500, color: t.textMuted, flexShrink: 0 }}
                    >
                      {new Date(reg.event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Helper components
   ═══════════════════════════════════════════ */

function SectionHeader({ title, noMargin }: { title: string; noMargin?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: noMargin ? 0 : "16px",
      }}
    >
      <div style={{ width: "24px", height: "2px", background: t.accent }} />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: t.textMuted,
        }}
      >
        {title}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  editing,
  placeholder,
  required,
  disabled,
  icon,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  editing: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: t.textFaint,
          marginBottom: "6px",
        }}
      >
        {label}
        {required && <span style={{ color: t.accent }}> *</span>}
      </label>
      {editing && !disabled ? (
        <div style={{ position: "relative" }}>
          {icon && (
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              {icon}
            </div>
          )}
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: icon ? "10px 14px 10px 36px" : "10px 14px",
              fontSize: "14px",
              fontFamily: t.sans,
              color: t.text,
              background: t.bg,
              border: `1px solid ${t.border}`,
              borderRadius: "4px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = t.text)}
            onBlur={(e) => (e.currentTarget.style.borderColor = t.border)}
          />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon}
          <span
            style={{
              fontSize: "14px",
              color: value ? t.text : t.textFaint,
              fontStyle: value ? "normal" : "italic",
            }}
          >
            {value || placeholder || "—"}
          </span>
          {disabled && (
            <span
              style={{
                fontSize: "10px",
                color: t.textFaint,
                background: t.borderLight,
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              Managed by auth
            </span>
          )}
        </div>
      )}
    </div>
  );
}