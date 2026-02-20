// app/api/users/[userId]/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { PaymentStatus } from "@/lib/generated/prisma"; 

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    const { userId } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.id !== targetUser.id && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    // Count events by status
    const [
      totalEvents,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      upcomingEvents,
    ] = await Promise.all([
      prisma.event.count({ where: { organizerId: targetUser.id } }),
      prisma.event.count({
        where: { organizerId: targetUser.id, status: "PUBLISHED" },
      }),
      prisma.event.count({
        where: { organizerId: targetUser.id, status: "DRAFT" },
      }),
      prisma.event.count({
        where: { organizerId: targetUser.id, status: "CANCELLED" },
      }),
      prisma.event.count({
        where: {
          organizerId: targetUser.id,
          startDate: { gt: now },
          status: "PUBLISHED",
        },
      }),
    ]);

    // Total attendees across all organizer's events
    const totalAttendees = await prisma.registration.count({
      where: {
        event: { organizerId: targetUser.id },
        status: "APPROVED",
      },
    });

    // Total revenue from paid orders
    const revenueAgg = await prisma.order.aggregate({
      where: {
        event: { organizerId: targetUser.id },
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: { amount: true },
    });
    const totalRevenue =
      revenueAgg._sum.amount ??0;

    // Average rating from feedback
    const ratingAgg = await prisma.feedback.aggregate({
      where: {
        event: { organizerId: targetUser.id },
        status: "APPROVED",
      },
      _avg: { rating: true },
    });
    const averageRating = ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        draftEvents,
        cancelledEvents,
        upcomingEvents,
        totalAttendees,
        totalRevenue,
        averageRating,
      },
    });
  } catch (error) {
    console.error("[USER_STATS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
