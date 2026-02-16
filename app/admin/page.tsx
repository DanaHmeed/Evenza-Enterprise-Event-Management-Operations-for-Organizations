// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  DollarSign,
  Ticket,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  UserPlus,
  CalendarPlus,
  ShieldCheck,
  Activity,
  Star,
  MessageSquare,
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  publishedEvents: number;
  totalRevenue: number;
  totalTickets: number;
  totalFeedbacks: number;
  pendingFeedbacks: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentEvent {
  id: string;
  title: string;
  status: string;
  organizer: { name: string };
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users for stats
        const usersRes = await fetch("/api/users?pageSize=5");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const allUsers = usersData.data || [];
          setRecentUsers(allUsers.slice(0, 5));

          // Derive basic stats from users list
          const usersPagination = usersData.pagination || {};
          const totalUsersCount = usersPagination.total || allUsers.length;

          // Fetch events
          const eventsRes = await fetch("/api/events?pageSize=5&sortBy=createdAt&sortOrder=desc");
          let eventsData: any = { data: [], pagination: {} };
          if (eventsRes.ok) {
            eventsData = await eventsRes.json();
            setRecentEvents(eventsData.data || []);
          }

          // Fetch feedback count
          const feedbackRes = await fetch("/api/feedback?pageSize=1");
          let feedbackTotal = 0;
          let pendingCount = 0;
          if (feedbackRes.ok) {
            const fbData = await feedbackRes.json();
            feedbackTotal = fbData.pagination?.total || 0;
          }
          const pendingRes = await fetch("/api/feedback?pageSize=1&status=PENDING");
          if (pendingRes.ok) {
            const pData = await pendingRes.json();
            pendingCount = pData.pagination?.total || 0;
          }

          setStats({
            totalUsers: totalUsersCount,
            totalOrganizers: allUsers.filter((u: any) => u.role === "ORGANIZER").length,
            totalEvents: eventsData.pagination?.total || 0,
            publishedEvents: (eventsData.data || []).filter((e: any) => e.status === "PUBLISHED").length,
            totalRevenue: 0, // Would need a dedicated endpoint
            totalTickets: 0,
            totalFeedbacks: feedbackTotal,
            pendingFeedbacks: pendingCount,
          });
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <Users className="w-5 h-5" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      color: "text-blue-600",
      href: "/admin/users",
    },
    {
      label: "Organizers",
      value: stats?.totalOrganizers || 0,
      icon: <ShieldCheck className="w-5 h-5" />,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      color: "text-purple-600",
      href: "/admin/users?role=ORGANIZER",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      icon: <CalendarDays className="w-5 h-5" />,
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      color: "text-orange-600",
      href: "/admin/events",
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      color: "text-green-600",
      href: "/admin/orders",
    },
    {
      label: "Feedbacks",
      value: stats?.totalFeedbacks || 0,
      icon: <MessageSquare className="w-5 h-5" />,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      color: "text-amber-600",
      href: "/admin/feedback",
    },
    {
      label: "Pending Reviews",
      value: stats?.pendingFeedbacks || 0,
      icon: <Star className="w-5 h-5" />,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      color: "text-red-600",
      href: "/admin/feedback?status=PENDING",
    },
  ];

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700",
      ORGANIZER: "bg-purple-100 text-purple-700",
      USER: "bg-gray-100 text-gray-600",
    };
    return map[role] || map.USER;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED: "bg-green-100 text-green-700",
      DRAFT: "bg-gray-100 text-gray-600",
      CANCELLED: "bg-red-100 text-red-600",
    };
    return map[status] || map.DRAFT;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 group-hover:text-orange-600 transition-colors">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Manage Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
          { label: "Manage Events", href: "/admin/events", icon: <CalendarDays className="w-4 h-4" /> },
          { label: "Moderate Feedback", href: "/admin/feedback", icon: <MessageSquare className="w-4 h-4" /> },
          { label: "Categories", href: "/admin/categories", icon: <Activity className="w-4 h-4" /> },
        ].map((a, i) => (
          <Link
            key={i}
            href={a.href}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-orange-200 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
              {a.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs flex-shrink-0">
                      {u.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Events</h2>
            <Link href="/admin/events" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No events yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/events`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">by {e.organizer?.name || "Unknown"}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(e.status)}`}>
                    {e.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}