// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  CalendarDays,
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  CalendarPlus,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface OrganizerStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  averageRating: number;
}

interface RecentEvent {
  id: string;
  title: string;
  status: string;
  startDate: string;
  _count: { registrations: number };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch organizer stats
        const statsRes = await fetch(`/api/users/${user.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        }

        // Fetch recent events
        const eventsRes = await fetch(
          "/api/events?pageSize=5&sortBy=createdAt&sortOrder=desc"
        );
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setRecentEvents(eventsData.data || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: <CalendarDays className="w-5 h-5" />,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Total Attendees",
      value: stats?.totalAttendees || 0,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Avg. Rating",
      value: stats?.averageRating ? `${stats.averageRating}/5` : "N/A",
      icon: <Star className="w-5 h-5" />,
      color: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-100",
    },
  ];

  const quickStats = [
    {
      label: "Published",
      value: stats?.publishedEvents || 0,
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    },
    {
      label: "Drafts",
      value: stats?.draftEvents || 0,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
    },
    {
      label: "Upcoming",
      value: stats?.upcomingEvents || 0,
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
    },
    {
      label: "Cancelled",
      value: stats?.cancelledEvents || 0,
      icon: <XCircle className="w-4 h-4 text-red-400" />,
    },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: "bg-green-100 text-green-700",
      DRAFT: "bg-gray-100 text-gray-600",
      CANCELLED: "bg-red-100 text-red-600",
      COMPLETED: "bg-blue-100 text-blue-600",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "Organizer"} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your events.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickStats.map((qs, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3"
          >
            {qs.icon}
            <div>
              <p className="text-lg font-bold text-gray-900">{qs.value}</p>
              <p className="text-xs text-gray-500">{qs.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Events</h2>
            <Link
              href="/dashboard/events"
              className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                You haven&apos;t created any events yet.
              </p>
              <Link
                href="/dashboard/events/create"
                className="text-sm text-orange-600 font-semibold hover:underline"
              >
                Create your first event →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDate(event.startDate)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {event._count.registrations} registered
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(event.status)}`}
                  >
                    {event.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              {
                label: "Create New Event",
                href: "/dashboard/events/create",
                icon: <CalendarPlus className="w-4 h-4" />,
                desc: "Set up a new event",
              },
              {
                label: "Manage Events",
                href: "/dashboard/events",
                icon: <CalendarDays className="w-4 h-4" />,
                desc: "Edit or publish events",
              },
              {
                label: "View Attendees",
                href: "/dashboard/attendees",
                icon: <Users className="w-4 h-4" />,
                desc: "Check registrations",
              },
              {
                label: "QR Scanner",
                href: "/dashboard/scanner",
                icon: <Ticket className="w-4 h-4" />,
                desc: "Check in attendees",
              },
              {
                label: "View Analytics",
                href: "/dashboard/analytics",
                icon: <TrendingUp className="w-4 h-4" />,
                desc: "Revenue & insights",
              },
              {
                label: "Preview Profile",
                href: "/profile",
                icon: <Eye className="w-4 h-4" />,
                desc: "Your public profile",
              },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}