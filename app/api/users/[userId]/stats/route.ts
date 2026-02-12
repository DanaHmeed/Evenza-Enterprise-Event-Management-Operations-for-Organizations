import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/require-role";

type Params = { params: Promise<{ userId: string }> };

// GET - Get user statistics
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { userId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.userId !== userId && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only view your own statistics" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "ORGANIZER" || user.role === "ADMIN") {
      // ── Organizer/Admin Stats ──
      const [
        totalEvents,
        publishedEvents,
        cancelledEvents,
        totalRevenue,
        upcomingEvents,
        totalAttendees,
        averageRating,
      ] = await Promise.all([
        prisma.event.count({
          where: { organizerId: userId },
        }),
        prisma.event.count({
          where: { organizerId: userId, status: "PUBLISHED" },
        }),
        prisma.event.count({
          where: { organizerId: userId, status: "CANCELLED" },
        }),
        prisma.order.aggregate({
          where: {
            event: { organizerId: userId },
            paymentStatus: "PAID",
          },
          _sum: { amount: true },
        }),
        prisma.event.count({
          where: {
            organizerId: userId,
            status: "PUBLISHED",
            startDate: { gte: new Date() },
          },
        }),
        prisma.registration.count({
          where: {
            event: { organizerId: userId },
            status: "APPROVED",
          },
        }),
        prisma.feedback.aggregate({
          where: {
            event: { organizerId: userId },
            status: "APPROVED",
          },
          _avg: { rating: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalEvents,
          publishedEvents,
          draftEvents: totalEvents - publishedEvents - cancelledEvents,
          cancelledEvents,
          upcomingEvents,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalAttendees,
          averageRating: Math.round((averageRating._avg.rating || 0) * 10) / 10,
        },
      });
    } else {
      // ── Regular User Stats ──
      const [
        totalRegistrations,
        totalTickets,
        upcomingEvents,
        attendedEvents,
        feedbacksGiven,
        totalSpent,
      ] = await Promise.all([
        prisma.registration.count({
          where: { userId, status: "APPROVED" },
        }),
        prisma.ticket.count({
          where: { userId, status: "PAID" },
        }),
        prisma.registration.count({
          where: {
            userId,
            status: "APPROVED",
            event: { startDate: { gte: new Date() } },
          },
        }),
        prisma.registration.count({
          where: {
            userId,
            status: "APPROVED",
            event: { endDate: { lt: new Date() } },
          },
        }),
        prisma.feedback.count({
          where: { userId },
        }),
        prisma.order.aggregate({
          where: { userId, paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalRegistrations,
          totalTickets,
          upcomingEvents,
          attendedEvents,
          feedbacksGiven,
          totalSpent: totalSpent._sum.amount || 0,
        },
      });
    }
  } catch (error) {
    console.error("[USER_STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}