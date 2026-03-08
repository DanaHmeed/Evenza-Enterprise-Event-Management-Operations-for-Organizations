// app/api/organizer/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireOrganizer, isAuthError } from "@/lib/auth/require-role";

export async function GET() {
  try {
    const auth = await requireOrganizer();
    if (isAuthError(auth)) return auth;

    const userId = auth.userId;
    const now = new Date();

    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      upcomingEvents,
      totalAttendees,
      pendingAttendees,
      checkedInCount,
      revenueAgg,
      totalOrders,
      ratingAgg,
      totalFeedbacks,
      recentEvents,
    ] = await Promise.all([
      prisma.event.count({ where: { organizerId: userId } }),
      prisma.event.count({ where: { organizerId: userId, status: "PUBLISHED" } }),
      prisma.event.count({ where: { organizerId: userId, status: "DRAFT" } }),
      prisma.event.count({ where: { organizerId: userId, status: "CANCELLED" } }),
      prisma.event.count({ where: { organizerId: userId, startDate: { gt: now }, status: "PUBLISHED" } }),
      prisma.registration.count({ where: { event: { organizerId: userId }, status: "APPROVED" } }),
      prisma.registration.count({ where: { event: { organizerId: userId }, status: "PENDING" } }),
      prisma.registration.count({ where: { event: { organizerId: userId }, checkedIn: true } }),
      prisma.order.aggregate({
        where: { event: { organizerId: userId }, paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { event: { organizerId: userId } } }),
      prisma.feedback.aggregate({
        where: { event: { organizerId: userId }, status: "APPROVED" },
        _avg: { rating: true },
      }),
      prisma.feedback.count({ where: { event: { organizerId: userId } } }),
      prisma.event.findMany({
        where: { organizerId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          eventType: true,
          price: true,
          capacity: true,
          seatsRemaining: true,
          _count: { select: { registrations: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalEvents,
          publishedEvents,
          draftEvents,
          cancelledEvents,
          upcomingEvents,
          totalAttendees,
          pendingAttendees,
          checkedInCount,
          totalRevenue: revenueAgg._sum.amount ?? 0,
          totalOrders,
          averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0,
          totalFeedbacks,
        },
        recentEvents,
      },
    });
  } catch (error) {
    console.error("[ORGANIZER_STATS]", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}