// app/(root)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Ticket,
  CalendarDays,
  Star,
  Loader2,
  ExternalLink,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    registrations: number;
    organizedEvents: number;
    feedbacks: number;
    tickets: number;
  };
}

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in?redirect_url=/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.data || data);
        }
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      ADMIN: { bg: "bg-red-100", text: "text-red-700" },
      ORGANIZER: { bg: "bg-purple-100", text: "text-purple-700" },
      USER: { bg: "bg-gray-100", text: "text-gray-600" },
    };
    return map[role] || map.USER;
  };

  const badge = getRoleBadge(profile.role);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const stats = [
    {
      label: "Registrations",
      value: profile._count?.registrations || 0,
      icon: <CalendarDays className="w-4 h-4" />,
      href: "/my-events",
    },
    {
      label: "Tickets",
      value: profile._count?.tickets || 0,
      icon: <Ticket className="w-4 h-4" />,
      href: "/my-tickets",
    },
    {
      label: "Reviews Given",
      value: profile._count?.feedbacks || 0,
      icon: <Star className="w-4 h-4" />,
      href: "#",
    },
  ];

  if (profile.role === "ORGANIZER" || profile.role === "ADMIN") {
    stats.push({
      label: "Events Organized",
      value: profile._count?.organizedEvents || 0,
      icon: <CalendarDays className="w-4 h-4" />,
      href: "/dashboard/events",
    });
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-500 relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="-mt-14 mb-4 flex items-end justify-between">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                {profile.avatar || user?.imageUrl ? (
                  <img
                    src={profile.avatar || user?.imageUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                    <User className="w-10 h-10 text-orange-300" />
                  </div>
                )}
              </div>
              <Link
                href="https://accounts.clerk.dev/user"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Edit Profile
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>

            {/* Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                  {profile.role}
                </span>
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Joined {formatDate(profile.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-gray-400" />
                  {profile.isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  className="bg-gray-50 rounded-xl px-4 py-3 hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-orange-500 mb-1">
                    {s.icon}
                  </div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <Link
            href="/my-tickets"
            className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-500 transition-colors">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">My Tickets</p>
              <p className="text-xs text-gray-500">View your QR tickets</p>
            </div>
          </Link>
          <Link
            href="/my-events"
            className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-orange-200 hover:shadow-sm transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-500 transition-colors">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">My Registrations</p>
              <p className="text-xs text-gray-500">Events you signed up for</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}