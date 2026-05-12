// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isAuthError(auth)) return auth;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
  totalUsers,
  totalOrganizers,
  newUsersThisMonth,
  eventsByStatus,
  registrationsByStatus,
  totalTickets,
  totalOrders,
  revenueAgg,
  pendingFeedbacks,
  totalFeedbacks,
  unreadMessages,
  recentUsers,
  recentEvents,
  recentOrders,
] = await Promise.all([
  prisma.user.count(),
  prisma.user.count({ where: { role: "ORGANIZER" } }),
  prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  prisma.event.groupBy({ by: ["status"], _count: { _all: true } }),
  prisma.registration.groupBy({ by: ["status"], _count: { _all: true } }),
  prisma.ticket.count(),
  prisma.order.count(),
  prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { amount: true } }),
  prisma.feedback.count({ where: { status: "PENDING" } }),
  prisma.feedback.count(),
  prisma.contactMessage.count({ where: { isRead: false } }),
  prisma.user.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
  }),
  prisma.event.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, status: true, startDate: true,
      eventType: true, price: true,
      organizer: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  }),
  prisma.order.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    select: {
      id: true, amount: true, currency: true,
      paymentStatus: true, paymentMethod: true, createdAt: true,
      user: { select: { name: true } },
      event: { select: { title: true } },
    },
  }),
]);
    // ── Unpack groupBy results ────────────────────────────────────
    const eventCount = (status: string) =>
      eventsByStatus.find((r) => r.status === status)?._count._all ?? 0;

    const regCount = (status: string) =>
      registrationsByStatus.find((r) => r.status === status)?._count._all ?? 0;

    const totalEvents        = eventsByStatus.reduce((s, r) => s + r._count._all, 0);
    const publishedEvents    = eventCount("PUBLISHED");
    const draftEvents        = eventCount("DRAFT");
    const cancelledEvents    = eventCount("CANCELLED");

    const totalRegistrations    = registrationsByStatus.reduce((s, r) => s + r._count._all, 0);
    const approvedRegistrations = regCount("APPROVED");
    const pendingRegistrations  = regCount("PENDING");

    const totalRevenue = revenueAgg._sum.amount ?? 0;

    // ── Serialize dates ───────────────────────────────────────────
    const serializedUsers = recentUsers.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));
    const serializedEvents = recentEvents.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
    }));
    const serializedOrders = recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          counts: {
            totalUsers, totalOrganizers, newUsersThisMonth,
            totalEvents, publishedEvents, draftEvents, cancelledEvents,
            totalRegistrations, approvedRegistrations, pendingRegistrations,
            totalTickets, totalOrders, totalRevenue,
            pendingFeedbacks, totalFeedbacks, unreadMessages,
          },
          recentUsers:  serializedUsers,
          recentEvents: serializedEvents,
          recentOrders: serializedOrders,
        },
      },
      {
        status: 200,
        headers: {
          // Private cache: browser reuses this response for 30s,
          // serves stale for up to 2min while revalidating in background.
          // Admin-only so no public CDN caching.
          "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}