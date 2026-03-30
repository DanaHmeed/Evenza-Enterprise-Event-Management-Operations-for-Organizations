// app/api/users/[id]/hub-summary/route.ts
//
// Single API call for the "My Hub" page
// Returns: stats, upcoming registrations, past registrations, recommended events

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: paramsUserId } = await params;
    const authResult = await auth();
    const { userId } = authResult;
    if (!userId || userId !== paramsUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // ── Parallel queries for maximum speed ──
    const [user, upcoming, past, feedbackCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: paramsUserId },
        select: {
          name: true,
          _count: {
            select: {
              registrations: true,
              feedbacks: true,
            },
          },
        },
      }),

      // Upcoming registrations
      prisma.registration.findMany({
        where: {
          userId: paramsUserId,
          status: { notIn: ["CANCELLED", "REJECTED"] },
          event: { startDate: { gt: now } },
        },
        orderBy: { event: { startDate: "asc" } },
        take: 6,
        select: {
          id: true,
          status: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              isOnline: true,
              city: true,
              venueName: true,
              banner: true,
              categoryId: true,
              category: { select: { name: true } },
            },
          },
        },
      }),

      // Past registrations
      prisma.registration.findMany({
        where: {
          userId: paramsUserId,
          status: { notIn: ["CANCELLED", "REJECTED"] },
          event: { endDate: { lt: now } },
        },
        orderBy: { event: { startDate: "desc" } },
        take: 6,
        select: {
          id: true,
          status: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              isOnline: true,
              city: true,
              venueName: true,
              banner: true,
              categoryId: true,
              category: { select: { name: true } },
            },
          },
        },
      }),

      prisma.feedback.count({
        where: { userId: paramsUserId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Recommendations ──
    // Get categoryIds user has attended for personalization
    const attendedCategoryIds = [
      ...new Set(
        [...upcoming, ...past]
          .map((r) => r.event.categoryId)
          .filter(Boolean)
      ),
    ];

    const registeredEventIds = [...upcoming, ...past].map((r) => r.event.id);

    const recommended = await prisma.event.findMany({
      where: {
        startDate: { gt: now },
        status: "PUBLISHED",
        id: { notIn: registeredEventIds.length > 0 ? registeredEventIds : ["_"] },
        ...(attendedCategoryIds.length > 0
          ? { categoryId: { in: attendedCategoryIds } }
          : {}),
      },
      orderBy: { startDate: "asc" },
      take: 6,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        isOnline: true,
        city: true,
        venueName: true,
        banner: true,
        category: { select: { name: true } },
      },
    });

    // Backfill with popular events if too few recommendations
    let finalRecommended = recommended;
    if (recommended.length < 3) {
      const excludeIds = [
        ...registeredEventIds,
        ...recommended.map((e) => e.id),
      ];
      const backfill = await prisma.event.findMany({
        where: {
          startDate: { gt: now },
          status: "PUBLISHED",
          id: { notIn: excludeIds.length > 0 ? excludeIds : ["_"] },
        },
        orderBy: { registrations: { _count: "desc" } },
        take: 3 - recommended.length,
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          isOnline: true,
          city: true,
          venueName: true,
          banner: true,
          category: { select: { name: true } },
        },
      });
      finalRecommended = [...recommended, ...backfill];
    }

    // Upcoming count for stats
    const upcomingCount = await prisma.registration.count({
      where: {
        userId: paramsUserId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
        event: { startDate: { gt: now } },
      },
    });

    // Transform category relation to flat string for frontend
    const transformEvent = (e: { category?: { name: string } | null; [key: string]: unknown }) => ({
      ...e,
      category: e.category?.name || null,
      categoryId: undefined,
    });

    const transformReg = (r: { event: Parameters<typeof transformEvent>[0]; [key: string]: unknown }) => ({
      ...r,
      event: transformEvent(r.event),
    });

    return NextResponse.json(
      {
        data: {
          userName: user.name,
          stats: {
            totalRegistrations: user._count.registrations,
            eventsAttended: past.length,
            upcomingCount,
            reviewsGiven: feedbackCount,
          },
          upcoming: upcoming.map(transformReg),
          past: past.map(transformReg),
          recommended: finalRecommended.map(transformEvent),
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[HUB_SUMMARY]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}