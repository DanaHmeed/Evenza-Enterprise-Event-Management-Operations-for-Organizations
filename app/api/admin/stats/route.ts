// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-role";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isAuthError(auth)) return auth;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Single parallel batch — all counts in one round-trip
    const [
      totalUsers,
      totalOrganizers,
      newUsersThisMonth,
      totalEvents,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
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
      prisma.event.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.event.count({ where: { status: "DRAFT" } }),
      prisma.event.count({ where: { status: "CANCELLED" } }),
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "APPROVED" } }),
      prisma.registration.count({ where: { status: "PENDING" } }),
      prisma.ticket.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.feedback.count({ where: { status: "PENDING" } }),
      prisma.feedback.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      // Recent users (last 5)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      }),
      // Recent events (last 5, any status)
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          eventType: true,
          price: true,
          organizer: { select: { name: true } },
          _count: { select: { registrations: true } },
        },
      }),
      // Recent orders (last 5)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          currency: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          user: { select: { name: true } },
          event: { select: { title: true } },
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalOrganizers,
          newUsersThisMonth,
          totalEvents,
          publishedEvents,
          draftEvents,
          cancelledEvents,
          totalRegistrations,
          approvedRegistrations,
          pendingRegistrations,
          totalTickets,
          totalOrders,
          totalRevenue,
          pendingFeedbacks,
          totalFeedbacks,
          unreadMessages,
        },
        recentUsers,
        recentEvents,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}