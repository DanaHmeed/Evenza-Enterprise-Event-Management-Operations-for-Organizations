// app/admin/statistics/page.tsx
import { prisma } from "@/lib/db/prisma";
import { AdminBreadcrumb } from "@/components/admin/AdminUI";

export default async function AdminStatisticsPage() {
  // Fetch comprehensive statistics
  const [
    totalUsers,
    totalOrganizers,
    totalEvents,
    publishedEvents,
    totalRegistrations,
    totalRevenue,
    revenueByMonth,
    topOrganizers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.registration.count({ where: { status: "APPROVED" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { amount: true },
    }),
    // Revenue by month (last 6 months)
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as revenue
      FROM "Order"
      WHERE "paymentStatus" = 'PAID'
      AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month DESC
    `,
    // Top organizers by events
    prisma.user.findMany({
      where: { role: "ORGANIZER" },
      take: 10,
      include: {
        _count: {
          select: { organizedEvents: true },
        },
      },
      orderBy: {
        organizedEvents: {
          _count: "desc",
        },
      },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: "👥", color: "blue" },
    { label: "Organizers", value: totalOrganizers, icon: "🎯", color: "purple" },
    { label: "Total Events", value: totalEvents, icon: "📅", color: "green" },
    { label: "Published Events", value: publishedEvents, icon: "✅", color: "emerald" },
    { label: "Total Registrations", value: totalRegistrations, icon: "🎫", color: "orange" },
    {
      label: "Total Revenue",
      value: `$${totalRevenue._sum.amount || 0}`,
      icon: "💰",
      color: "yellow",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminBreadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Statistics" }]} />
      <h1 className="text-3xl font-bold mb-8">Platform Statistics</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top Organizers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Top Organizers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Total Events</th>
              </tr>
            </thead>
            <tbody>
              {topOrganizers.map((organizer, index) => (
                <tr key={organizer.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{index + 1}</td>
                  <td className="py-3 px-4">{organizer.name}</td>
                  <td className="py-3 px-4 text-gray-600">{organizer.email}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {organizer._count.organizedEvents} events
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}