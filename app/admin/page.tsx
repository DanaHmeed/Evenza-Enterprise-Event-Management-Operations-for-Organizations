import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  // Fetch statistics
  const [
    totalUsers,
    totalEvents,
    publishedEvents,
    pendingFeedback,
    totalRevenue,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.feedback.count({ where: { approved: false } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: {
          select: { name: true },
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "👥",
      link: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Total Events",
      value: totalEvents,
      icon: "📅",
      link: "/admin/events",
      color: "bg-green-500",
    },
    {
      title: "Published Events",
      value: publishedEvents,
      icon: "✅",
      link: "/admin/events",
      color: "bg-purple-500",
    },
    {
      title: "Pending Feedback",
      value: pendingFeedback,
      icon: "💬",
      link: "/admin/feedback",
      color: "bg-yellow-500",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue._sum.amount || 0}`,
      icon: "💰",
      link: "/admin/statistics",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span
                className={`${stat.color} text-white text-xs px-2 py-1 rounded`}
              >
                View
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    user.role === "ADMIN"
                      ? "bg-red-100 text-red-800"
                      : user.role === "ORGANIZER"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Events</h2>
            <Link
              href="/admin/events"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    by {event.organizer.name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    event.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}