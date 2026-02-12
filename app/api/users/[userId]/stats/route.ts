import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET - Get user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requesting own stats or if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (currentUserId !== params.userId && currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only view your own statistics" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get statistics based on role
    if (user.role === "ORGANIZER" || user.role === "ADMIN") {
      // Organizer stats
      const [totalEvents, publishedEvents, totalRevenue, upcomingEvents] =
        await Promise.all([
          prisma.event.count({
            where: { organizerId: params.userId },
          }),
          prisma.event.count({
            where: { organizerId: params.userId, status: "PUBLISHED" },
          }),
          prisma.order.aggregate({
            where: {
              event: { organizerId: params.userId },
              paymentStatus: "PAID",
            },
            _sum: { amount: true },
          }),
          prisma.event.count({
            where: {
              organizerId: params.userId,
              status: "PUBLISHED",
              startDate: { gte: new Date() },
            },
          }),
        ]);

      return NextResponse.json({
        totalEvents,
        publishedEvents,
        draftEvents: totalEvents - publishedEvents,
        totalRevenue: totalRevenue._sum.amount || 0,
        upcomingEvents,
      });
    } else {
      // Regular user stats
      const [totalRegistrations, totalTickets, upcomingEvents, attendedEvents] =
        await Promise.all([
          prisma.registration.count({
            where: { userId: params.userId, status: "APPROVED" },
          }),
          prisma.ticket.count({
            where: { userId: params.userId, status: "PAID" },
          }),
          prisma.registration.count({
            where: {
              userId: params.userId,
              status: "APPROVED",
              event: { startDate: { gte: new Date() } },
            },
          }),
          prisma.registration.count({
            where: {
              userId: params.userId,
              status: "APPROVED",
              event: { endDate: { lt: new Date() } },
            },
          }),
        ]);

      return NextResponse.json({
        totalRegistrations,
        totalTickets,
        upcomingEvents,
        attendedEvents,
      });
    }
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}